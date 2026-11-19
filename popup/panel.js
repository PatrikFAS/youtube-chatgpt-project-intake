'use strict';
// The panel is tied to its own window, never the globally last-focused window.
(() => {
  const state = {
    enabled: globalThis.YT2GPTSurface?.panel === true,
    windowId: null, epoch: 0, ready: false, pending: false, refreshing: false,
    disposed: false, collectionDirty: false, destinationsDirty: false,
    preferredLanguage: '', notice: '', kind: 'other',
    async initialize() {
      const current = await chrome.windows.getCurrent();
      if (!Number.isInteger(current?.id) || current.id < 0) throw Error('This panel window could not be confirmed. Use the toolbar popup fallback.');
      this.windowId = current.id;
      await loadDestinations(); await loadPreferences();
      const prefs = await chrome.storage.local.get('preferredTranscriptLanguage');
      this.preferredLanguage = prefs.preferredTranscriptLanguage || '';
      chrome.tabs.onActivated.addListener(info => {if(info.windowId === this.windowId)this.schedule();});
      chrome.tabs.onUpdated.addListener((id, info) => {
        if(id === activeTab?.id && (info.url || info.status === 'loading' || info.status === 'complete')) this.schedule();
      });
      chrome.tabs.onRemoved.addListener(id => {if(id === activeTab?.id)this.schedule();});
      chrome.tabs.onDetached?.addListener((_id, info) => {if(info.oldWindowId === this.windowId)this.schedule();});
      chrome.tabs.onAttached?.addListener((_id, info) => {if(info.newWindowId === this.windowId)this.schedule();});
      chrome.storage.onChanged.addListener((changes, area) => {
        if(area === 'session' && changes[YT2GPTCollection.KEY]) {
          this.collectionDirty = true; invalidatePromptPreview();
          if(!busy && !sending && !this.refreshing)this.finish();
        }
        if(area === 'local' && changes.destinations) {this.destinationsDirty=true;this.schedule();}
      });
      window.addEventListener('unload',()=>{this.disposed=true;this.epoch++;this.ready=false;});
      await this.schedule();
    },
    async schedule() {
      this.epoch++; this.ready=false; this.pending=true;
      collectionCaptureProblem='';videoContext=null;sourceTabId=null;currentTranscript=null;transcriptCache.clear();
      invalidatePromptPreview();hide(els.transcriptPanel);clearMessages();
      els.videoTitle.textContent='Updating active tab…';
      els.sourceHint.textContent='Waiting for this window’s current page. No previous video will be used.';
      setInteractionBusy(busy);
      return this.finish();
    },
    async finish() {
      if(!this.enabled || this.disposed || busy || sending || this.refreshing)return;
      if(!this.pending) {
        if(this.collectionDirty){this.collectionDirty=false;await refreshCollection();updateCustomUI();updateHandoffHelp();}
        return;
      }
      this.refreshing=true;
      try {
        while(this.pending && !sending && !this.disposed) {
          this.pending=false; const epoch=this.epoch;
          const tabs=await chrome.tabs.query({active:true,windowId:this.windowId});
          if(epoch!==this.epoch)continue;
          const tab=tabs[0] || null;
          let context=null,kind='other',problem='';
          if(tab?.url){
            const u=new URL(tab.url);
            if(YT2GPTCollection.videoId(tab.url)) {
              kind='youtube';
              try {
                const r=await chrome.tabs.sendMessage(tab.id,{type:'YT2GPT_GET_CONTEXT',strictIdentity:true});
                if(!r?.ok || r.data?.videoId!==YT2GPTCollection.videoId(tab.url))throw Error(r?.error||'This video is not ready. Retry after navigation finishes.');
                context=r.data;
              }catch(error){problem=friendlyError(error);}
            }else if(u.origin==='https://chatgpt.com'||u.origin==='https://claude.ai')kind='provider';
          }
          if(epoch!==this.epoch)continue;
          const check=await chrome.tabs.query({active:true,windowId:this.windowId});
          if(epoch!==this.epoch)continue;
          if(check[0]?.id!==tab?.id || (check[0]?.url||'')!==(tab?.url||'')){this.pending=true;this.epoch++;continue;}
          activeTab=tab;sourceTabId=tab?.id??null;videoContext=context;this.kind=kind;
          if(this.destinationsDirty){this.destinationsDirty=false;await loadDestinations();if(epoch!==this.epoch)continue;renderDestinationChoices();}
          if(context){renderVideoContext();choosePreferredTrack(this.preferredLanguage||context.browserLanguage||navigator.language);}
          else {els.videoTitle.textContent=kind==='provider'?'Assistant destination':'No YouTube video selected';els.videoMeta.textContent='';els.transcriptStatus.textContent='';}
          if(kind==='provider'){els.destinationName.value='';initChatGPT();}
          else showView(kind==='youtube'?'youtubeView':'otherView');
          this.ready=true;this.collectionDirty=false;
          renderCollection();updateCustomUI();updateHandoffHelp();setInteractionBusy(false);
          if(problem){els.sourceHint.textContent=problem;showWarning(problem+' Your collection is unchanged.');}
          if(this.notice){const notice=this.notice;this.notice='';showWarning(notice);}
        }
      }catch(error){this.ready=false;showView('otherView');showError(friendlyError(error));}
      finally{this.refreshing=false;if(this.pending&&!busy&&!sending)this.finish();}
    },
    capture() {
      if(!this.enabled)return null;
      return {epoch:this.epoch,ready:this.ready,tabId:activeTab?.id,windowId:this.windowId,url:activeTab?.url||'',videoId:videoContext?.videoId||null};
    },
    check(token) {
      if(!this.enabled)return;
      if(this.disposed||!this.ready||!token?.ready||token.epoch!==this.epoch||token.windowId!==this.windowId)this.abort();
    },
    abort() {
      this.notice='The active tab or video changed. The previous operation stopped; check any copied prompt or draft before continuing.';
      throw Error(this.notice);
    },
    async validate(token, requireVideo=false) {
      if(!this.enabled)return;
      this.check(token);
      const [tabs,tab]=await Promise.all([chrome.tabs.query({active:true,windowId:this.windowId}),chrome.tabs.get(token.tabId)]);
      this.check(token);
      if(tabs[0]?.id!==token.tabId||tab.windowId!==this.windowId||(tab.url||'')!==token.url)this.abort();
      if(requireVideo) {
        if(!token.videoId||YT2GPTCollection.videoId(tab.url)!==token.videoId)this.abort();
        const r=await chrome.tabs.sendMessage(token.tabId,{type:'YT2GPT_GET_CONTEXT',strictIdentity:true});
        this.check(token);
        if(!r?.ok||r.data?.videoId!==token.videoId)this.abort();
      }
    },
    async validateChoice(choice) {
      await this.validate(choice.binding,!choice.collection);
      if(this.enabled&&choice.collection){
        const r=await chrome.runtime.sendMessage({type:'COLLECTION_GET'});this.check(choice.binding);
        if(!r?.ok||r.state?.revision!==choice.collectionRevision||r.state?.generation!==choice.collectionGeneration)throw Error('The collection changed. Review the current sources and try again.');
      }
    }
  };
  globalThis.YT2GPTPanel=state;
})();
