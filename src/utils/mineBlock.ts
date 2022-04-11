import Arweave from "arweave";

export const mineBlock = async (arweave: Arweave): Promise<void> => {
  await arweave.api.get("mine");
};
