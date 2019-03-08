interface TokenStatus {
  address: Address;
  name: string;
  symbol: string;
  etherScanLink?: string;
}

const whitelist: { [network in Network]?: TokenStatus[] } = {
  main: [
    {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      etherScanLink: 'https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    {
      name: 'Basic Attention Token',
      symbol: 'BAT',
      etherScanLink: 'https://etherscan.io/token/0x0d8775f648430679a709e98d2b0cb6250d2887ef',
      address: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
    },
    {
      name: 'Bancor',
      symbol: 'BNT',
      etherScanLink: 'https://etherscan.io/token/0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
      address: '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
    },
    {
      name: 'Civic',
      symbol: 'CVC',
      etherScanLink: 'https://etherscan.io/token/0x41e5560054824ea6b0732e656e3ad64e20e94e45',
      address: '0x41e5560054824ea6b0732e656e3ad64e20e94e45',
    },
    {
      name: 'Dai',
      symbol: 'DAI',
      etherScanLink: 'https://etherscan.io/token/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    },
    {
      name: 'district0x',
      symbol: 'DNT',
      etherScanLink: 'https://etherscan.io/token/0x0abdace70d3790235af448c88547603b945604ea',
      address: '0x0abdace70d3790235af448c88547603b945604ea',
    },
    {
      name: 'Decentraland',
      symbol: 'MANA',
      etherScanLink: 'https://etherscan.io/token/0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
      address: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    },
    {
      name: 'Foam',
      symbol: 'FOAM',
      etherScanLink: 'https://etherscan.io/token/0x4946fcea7c692606e8908002e55a582af44ac121',
      address: '0x4946fcea7c692606e8908002e55a582af44ac121',
    },
    {
      name: 'Gnosis',
      symbol: 'GNO',
      etherScanLink: 'https://etherscan.io/token/0x6810e776880c02933d47db1b9fc05908e5386b96',
      address: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    },
    {
      name: 'Golem',
      symbol: 'GNT',
      etherScanLink: 'https://etherscan.io/token/0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
      address: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
    },
    {
      name: 'KyberNetwork',
      symbol: 'KNC',
      etherScanLink: 'https://etherscan.io/token/0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
      address: '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
    },
    {
      name: 'Livepeer',
      symbol: 'LPT',
      etherScanLink: 'https://etherscan.io/token/0x58b6a8a3302369daec383334672404ee733ab239',
      address: '0x58b6a8a3302369daec383334672404ee733ab239',
    },
    {
      name: 'Loom',
      symbol: 'LOOM',
      etherScanLink: 'https://etherscan.io/token/0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0',
      address: '0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0',
    },
    {
      name: 'Maker',
      symbol: 'MKR',
      etherScanLink: 'https://etherscan.io/token/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    },
    {
      name: 'Melonport',
      symbol: 'MLN',
      etherScanLink: 'https://etherscan.io/token/0xec67005c4E498Ec7f55E092bd1d35cbC47C91892',
      address: '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892',
    },
    {
      name: 'Numeraire',
      symbol: 'NMR',
      etherScanLink: 'https://etherscan.io/token/0x1776e1f26f98b1a5df9cd347953a26dd3cb46671',
      address: '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671',
    },
    {
      name: 'OmiseGO',
      symbol: 'OMG',
      etherScanLink: 'https://etherscan.io/token/0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
      address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
    },
    {
      name: 'Polymath',
      symbol: 'POLY',
      etherScanLink: 'https://etherscan.io/token/0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec',
      address: '0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec',
    },
    {
      name: 'Augur',
      symbol: 'REP',
      etherScanLink: 'https://etherscan.io/token/0x1985365e9f78359a9B6AD760e32412f4a445E862',
      address: '0x1985365e9f78359a9B6AD760e32412f4a445E862',
    },
    {
      name: 'StatusNetwork',
      symbol: 'SNT',
      etherScanLink: 'https://etherscan.io/token/0x744d70fdbe2ba4cf95131626614a1763df805b9e',
      address: '0x744d70fdbe2ba4cf95131626614a1763df805b9e',
    },
    {
      name: 'Storj',
      symbol: 'STORJ',
      etherScanLink: 'https://etherscan.io/token/0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac',
      address: '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac',
    },
    {
      name: '0x',
      symbol: 'ZRX',
      etherScanLink: 'https://etherscan.io/token/0xe41d2489571d322189246dafa5ebde1f4699f498',
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
    },
    {
      name: 'AdEx',
      symbol: 'ADX',
      etherScanLink: 'https://etherscan.io/token/0x4470BB87d77b963A013DB939BE332f927f2b992e',
      address: '0x4470BB87d77b963A013DB939BE332f927f2b992e',
    },
    {
      name: 'adToken',
      symbol: 'ADT',
      etherScanLink: 'https://etherscan.io/token/0xd0d6d6c5fe4a677d343cc433536bb717bae167dd',
      address: '0xd0d6d6c5fe4a677d343cc433536bb717bae167dd',
    },
    {
      name: 'AirSwap',
      symbol: 'AST',
      etherScanLink: 'https://etherscan.io/token/0x27054b13b1b798b345b591a4d22e6562d47ea75a',
      address: '0x27054b13b1b798b345b591a4d22e6562d47ea75a',
    },
    {
      name: 'Aragon',
      symbol: 'ANT',
      etherScanLink: 'https://etherscan.io/token/0x960b236A07cf122663c4303350609A66A7B288C0',
      address: '0x960b236A07cf122663c4303350609A66A7B288C0',
    },
    {
      name: 'Aurora',
      symbol: 'AURA',
      etherScanLink: 'https://etherscan.io/token/0xcdcfc0f66c522fd086a1b725ea3c0eeb9f9e8814',
      address: '0xcdcfc0f66c522fd086a1b725ea3c0eeb9f9e8814',
    },
    {
      name: 'Bluzelle',
      symbol: 'BLZ',
      etherScanLink: 'https://etherscan.io/token/0x5732046a883704404f284ce41ffadd5b007fd668',
      address: '0x5732046a883704404f284ce41ffadd5b007fd668',
    },
    {
      name: 'Chainlink',
      symbol: 'LINK',
      etherScanLink: 'https://etherscan.io/token/0x514910771af9ca656af840dff83e8264ecf986ca',
      address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    },
    {
      name: 'Cindicator',
      symbol: 'CND',
      etherScanLink: 'https://etherscan.io/token/0xd4c435f5b09f855c3317c8524cb1f586e42795fa',
      address: '0xd4c435f5b09f855c3317c8524cb1f586e42795fa',
    },
    {
      name: 'DaoStack',
      symbol: 'GEN',
      etherScanLink: 'https://etherscan.io/token/0x543ff227f64aa17ea132bf9886cab5db55dcaddf',
      address: '0x543ff227f64aa17ea132bf9886cab5db55dcaddf',
    },
    {
      name: 'DigixDAO',
      symbol: 'DGD',
      etherScanLink: 'https://etherscan.io/token/0xe0b7927c4af23765cb51314a0e0521a9645f0e2a',
      address: '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a',
    },
    {
      name: 'Eidoo',
      symbol: 'EDO',
      etherScanLink: 'https://etherscan.io/token/0xced4e93198734ddaff8492d525bd258d49eb388e',
      address: '0xced4e93198734ddaff8492d525bd258d49eb388e',
    },
    {
      name: 'Funfair',
      symbol: 'FUN',
      etherScanLink: 'https://etherscan.io/token/0x419d0d8bdd9af5e606ae2232ed285aff190e711b',
      address: '0x419d0d8bdd9af5e606ae2232ed285aff190e711b',
    },
    {
      name: 'Grid+',
      symbol: 'GRID',
      etherScanLink: 'https://etherscan.io/token/0x12b19d3e2ccc14da04fae33e63652ce469b3f2fd',
      address: '0x12b19d3e2ccc14da04fae33e63652ce469b3f2fd',
    },
    {
      name: 'Loopring',
      symbol: 'LRC',
      etherScanLink: 'https://etherscan.io/token/0xef68e7c694f40c8202821edf525de3782458639f',
      address: '0xef68e7c694f40c8202821edf525de3782458639f',
    },
    {
      name: 'OST',
      symbol: 'OST',
      etherScanLink: 'https://etherscan.io/token/0x2c4e8f2d746113d0696ce89b35f0d8bf88e0aeca',
      address: '0x2c4e8f2d746113d0696ce89b35f0d8bf88e0aeca',
    },
    {
      name: 'Propy',
      symbol: 'PRO',
      etherScanLink: 'https://etherscan.io/token/0x226bb599a12c826476e3a771454697ea52e9e220',
      address: '0x226bb599a12c826476e3a771454697ea52e9e220',
    },
    {
      name: 'Quantstamp',
      symbol: 'QSP',
      etherScanLink: 'https://etherscan.io/token/0x99ea4db9ee77acd40b119bd1dc4e33e1c070b80d',
      address: '0x99ea4db9ee77acd40b119bd1dc4e33e1c070b80d',
    },
    {
      name: 'Raiden',
      symbol: 'RDN',
      etherScanLink: 'https://etherscan.io/token/0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6',
      address: '0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6',
    },
    {
      name: 'Request Network',
      symbol: 'REQ',
      etherScanLink: 'https://etherscan.io/token/0x8f8221afbb33998d8584a2b05749ba73c37a938a',
      address: '0x8f8221afbb33998d8584a2b05749ba73c37a938a',
    },
  ],
};

class TokenWhitelist {
  readonly whitelist?: TokenStatus[];

  constructor(readonly network?: Network | null) {
    if (network) {
      this.whitelist = whitelist[network];
    }
  }

  isWhitelisted(token: Address) {
    if (!this.whitelist) {
      return true;
    }

    return this.whitelist.some(({ address }) => token.toLowerCase() === address.toLowerCase());
  }

  getTokenData(token: Address) {
    if (!this.whitelist) {
      return undefined;
    }

    return this.whitelist.find(t => t.address.toLowerCase() === token.toLowerCase());
  }
}

export default TokenWhitelist;
