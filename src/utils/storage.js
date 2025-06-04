import localForage from 'localforage';

localForage.config({
  name: 'worklife',
  storeName: 'worklife_data',
});

export const saveData = async (key, value) => {
  try {
    await localForage.setItem(key, value);
  } catch (err) {
    console.error('Error saving data:', err);
  }
};

export const loadData = async (key) => {
  try {
    return await localForage.getItem(key);
  } catch (err) {
    console.error('Error loading data:', err);
    return null;
  }
};