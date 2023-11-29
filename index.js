import axios from "axios";

// utils

// chunkArray
// - splits an array into chunks of the given size
const chunkArray = (myArray, chunk_size) => {
  var results = [];
  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }
  return results;
};

const nfds = new Map();

const baseUrl = "https://api.nf.domains";

// getNFDByName
// - returns the NFD record for the given name
const getNFDByName = async (name) => {
  if (nfds.has(name)) {
    return nfds.get(name);
  }
  const response = await axios.get(`${baseUrl}/nfd/${name}`);
  const nfd = response.data;
  nfds.set(name, nfd);
  return nfd;
};

// getNFDByAddress
// - returns the NFD record for the given address
const getNFDByAddress = async (address) => {
  if (nfds.has(address)) {
    return nfds.get(address);
  }
  const response = await axios.get(`${baseUrl}/nfd/lookup`, {
    params: {
      address,
    },
  });
  const nfd = response.data;
  nfds.set(address, nfd);
  return nfd;
};

const getNFDByAddressBatch = async (data, opts = { onError: () => {} }) => {
  const dataSet = Array.from(new Set(data));
  dataSet
    .filter((x) => !nfds.has(x))
    .forEach((key) => {
      nfds.set(key, null);
    });
  const chunkSize = 20; // length of address must be lesser or equal than 20
  const addressChunks = chunkArray(data, chunkSize);
  const results = await Promise.all(
    addressChunks.map((addressChunk, index) => {
      let url = "https://api.nf.domains/nfd/lookup?";
      let params = new URLSearchParams();
      addressChunk.forEach((address) => {
        params.append("address", address); // Assuming the first element is the address
      });
      params.append("view", "tiny");
      params.append("allowUnverified", "true");
      url += params.toString();
      return axios
        .get(url)
        .then(({ data }) => data)
        .catch(opts.onError || console.error);
    })
  );
  // results is an object or undefined
  // reduce results to a single object
  const finalResult = results.reduce((acc, result) => {
    return { ...acc, ...result };
  }, {});
  Object.entries(finalResult).forEach(([key, value]) => {
    nfds.set(key, value);
  });
  return finalResult;
};

const getNFDs = () => {
  return Object.fromEntries(nfds.entries());
};

export default {
  getNFDByName,
  getNFDByAddress,
  getNFDByAddressBatch,
  getNFDs,
};
