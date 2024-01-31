# Contracts-next scripts

Scripts showing how to interact with [contracts-next](https://github.com/thirdweb-dev/contracts-next) using the thirdweb SDK.

```bash
scripts/erc721/
|
|-- deploy: "deploy an ERC-721 core contract i.e. a minimal proxy for an ERC-721 Core contract."
|-- installHook: "install a hook into a core contract."
|
|-- allowlistMint
|   |-- setClaimConditions: "set a price and allowlist for your mint."
|   |-- setFeeCongig: "set sale and fee recipients for your mint."
|   |-- mint: "mint a token on your ERC-721 contract."
|
|-- royalty
|   |-- setRoyaltyInfo: "set a default royalty recipient and BPS for your NFTs."
|
|-- metadata
|   |-- lazyMint: "lazy mint metadata for your NFTs"
```

```bash
# Install dependencies. Required: node v18^
yarn install
```

# Deployments (Goerli)

- `CloneFactory`: [0x276681b249D043dfd3e833fA2862B797dA2BF68E](https://thirdweb.com/goerli/0x276681b249D043dfd3e833fA2862B797dA2BF68E)

## ERC-721

**Core:**

- `ERC721Core` _implementation_: [0x7720573Fe31a2f2fe523E24CC4904d0040947FA5](https://thirdweb.com/goerli/0x7720573Fe31a2f2fe523E24CC4904d0040947FA5)

**Hooks:**

- `AllowlistMintHookERC721`: [0xd2D7CD9F389bE8d6170df8e1B0908A78074da4BF](https://thirdweb.com/goerli/0xd2D7CD9F389bE8d6170df8e1B0908A78074da4BF)
- `LazyMintMetadataHook`: [0xe9835BeA658343E5D56E5039b14A35c38Fc6De36](https://thirdweb.com/goerli/0xfe5B36Ea6c0732a07c401Ac51E2B293c59D7199e)
- `RoyaltyHook`: [0x2eD5Abc5Ee2da6aCA33c2459d0331fB840771fd6](https://thirdweb.com/goerli/0x50Bc84D0276e5093192e40b0879Bf74Ca5bFCb3a)
