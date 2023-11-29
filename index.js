import axios from "axios";

const baseUrl = "https://api.nf.domains";

// getNFDByName
// - returns the NFD record for the given name
const getNFDByName = async (name) => {
  const response = await axios.get(`${baseUrl}/nfd/${name}`);
  return response.data;
};

// getNFDByAddress
// - returns the NFD record for the given address
const getNFDByAddress = async (address) => {
  const response = await axios.get(`${baseUrl}/nfd/lookup`, {
    params: {
      address,
    },
  });
  return response.data;
};

// chunkArray
// - splits an array into chunks of the given size
const chunkArray = (myArray, chunk_size) => {
  var results = [];
  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }
  return results;
};

const getNFDByAddressBatch = async (data) => {
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
        .catch((error) =>
          console.error("Error fetching additional data:", error)
        );
    })
  );
  // results is an object or undefined
  // reduce results to a single object
  const finalResult = results.reduce((acc, result) => {
    return { ...acc, ...result };
  }, {});
  return finalResult;
};

export default {
  getNFDByName,
  getNFDByAddress,
  getNFDByAddressBatch,
};
