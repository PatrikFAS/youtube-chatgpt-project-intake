'use strict';

const listEl = document.getElementById('destinationList');
const emptyEl = document.getElementById('emptyState');
const newNameEl = document.getElementById('newName');
const newUrlEl = document.getElementById('newUrl');
const addButton = document.getElementById('addButton');
const messageEl = document.getElementById('message');

window.addEventListener('DOMContentLoaded', render);
addButton.addEventListener('click', addDestination);

async function getDestinations() {
  let { destinations = [] } = await chrome.storage.local.get('destinations');
  if (!Array.isArray(destinations)) destinations = [];
  if (!destinations.some((d) => d.id === 'general')) {
    destinations.unshift({ id:'general', name:'General ChatGPT', url:'https://chatgpt.com/', builtIn:true });
    await chrome.storage.local.set({ destinations });
  }
  return destinations;
}

async function render() {
  const destinations = await getDestinations();
  listEl.replaceChildren();

  for (const dest of destinations) {
    const row = document.createElement('div');
    row.className = 'destination';

    const nameWrap = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = dest.name;
    nameWrap.appendChild(name);
    if (dest.builtIn) {
      const badge = document.createElement('div');
      badge.className = 'built-in';
      badge.textContent = 'Built in';
      nameWrap.appendChild(badge);
    }

    const url = document.createElement('div');
    url.className = 'url';
    url.textContent = dest.url;

    const actions = document.createElement('div');
    if (!dest.builtIn) {
      const edit = document.createElement('button');
      edit.className = 'secondary';
      edit.textContent = 'Edit';
      edit.addEventListener('click', () => editDestination(dest));

      const del = document.createElement('button');
      del.className = 'danger';
      del.textContent = 'Delete';
      del.style.marginLeft = '6px';
      del.addEventListener('click', () => deleteDestination(dest.id));
      actions.append(edit, del);
    }

    row.append(nameWrap, url, actions);
    listEl.appendChild(row);
  }

  emptyEl.classList.toggle('hidden', destinations.some((d) => !d.builtIn));
}

async function addDestination() {
  clearMessage();
  const name = newNameEl.value.trim();
  const url = validateUrl(newUrlEl.value);
  if (!name) return showMessage('Give the destination a name.', true);
  if (!url) return showMessage('Enter a valid https://chatgpt.com URL.', true);

  const destinations = await getDestinations();
  destinations.push({
    id:`dest-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name,
    url,
    builtIn:false
  });
  await chrome.storage.local.set({ destinations });
  newNameEl.value = '';
  newUrlEl.value = '';
  showMessage(`Added “${name}”.`);
  await render();
}

async function editDestination(dest) {
  const name = prompt('Destination name:', dest.name);
  if (name === null) return;
  const urlInput = prompt('ChatGPT URL:', dest.url);
  if (urlInput === null) return;
  const url = validateUrl(urlInput);
  if (!name.trim() || !url) return showMessage('Name or URL was invalid.', true);

  const destinations = await getDestinations();
  const index = destinations.findIndex((d) => d.id === dest.id);
  if (index >= 0) {
    destinations[index] = { ...destinations[index], name:name.trim(), url };
    await chrome.storage.local.set({ destinations });
    await render();
  }
}

async function deleteDestination(id) {
  const destinations = await getDestinations();
  const dest = destinations.find((d) => d.id === id);
  if (!dest || dest.builtIn) return;
  if (!confirm(`Delete “${dest.name}”?`)) return;

  const updated = destinations.filter((d) => d.id !== id);
  const stored = await chrome.storage.local.get('lastDestinationId');
  const changes = { destinations:updated };
  if (stored.lastDestinationId === id) changes.lastDestinationId = 'general';
  await chrome.storage.local.set(changes);
  await render();
}

function validateUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.origin !== 'https://chatgpt.com') return null;
    return url.toString();
  } catch { return null; }
}

function showMessage(message, isError=false) {
  messageEl.textContent = message;
  messageEl.classList.remove('hidden');
  messageEl.classList.toggle('error', isError);
}
function clearMessage() {
  messageEl.textContent = '';
  messageEl.classList.add('hidden');
  messageEl.classList.remove('error');
}
