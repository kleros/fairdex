import 'jest-dom/extend-expect';

import React, { ReactElement } from 'react';
import { cleanup, fireEvent, getByTestId, getByTitle } from 'react-testing-library';
import { BrowserRouter as Router } from 'react-router-dom';

import { renderWithRedux } from './utils';

import EndedAuctions from '../pages/main/auctions/containers/EndedAuctions';

import AuctionNavBar from '../pages/main/layout/NavBar/Auctions';
import Filters from '../pages/main/layout/Filters';

import auctions from '../__mocks__/auctions';
import frt from '../__mocks__/frt';
import tokens from '../__mocks__/tokens';
import RunningAuctions from '../pages/main/auctions/containers/RunningAuctions';

beforeEach(jest.resetAllMocks);

afterEach(cleanup);

describe('Auction list filtering', () => {
  describe('Filter by tokens I hold', () => {
    test('should show the right count', () => {
      const { getByTestId } = renderPage(<EndedAuctions />);

      const count = getByTestId('tokens-i-hold-count');

      expect(count).toHaveTextContent('22');
    });

    test('should show the right number of cards when filtering', () => {
      const { getByTestId, getAllByTestId } = renderPage(<EndedAuctions />);

      const filter = getByTestId('tokens-i-hold-filter');
      fireEvent.click(filter);

      const cards = getAllByTestId(/auction-card-*./);

      expect(cards.length).toEqual(16);
    });
  });

  describe('Filter by claimable auctions', () => {
    test('should show the right count', () => {
      const { getByTestId } = renderPage();

      const count = getByTestId('claimable-auctions-count');
      expect(count).toHaveTextContent('3');
    });

    test('should show the right number of cards when filtering', () => {
      const { getByTestId, getAllByTestId } = renderPage(<EndedAuctions />);

      const filter = getByTestId('claimable-auctions-filter');
      fireEvent.click(filter);

      const cards = getAllByTestId(/auction-card-*./);

      expect(cards.length).toEqual(3);
    });
  });

  describe('Filter by sell tokens', () => {
    const countByToken: any = {
      CWBR: '1',
      DAI: '2',
      GEN: '1',
      MKR: '4',
      OMG: '4',
      PXT: '2',
      RDN: '3',
      WETH: '13',
    };

    const cardsByToken: any = {
      CWBR: 1,
      DAI: 2,
      GEN: 1,
      MKR: 2,
      OMG: 2,
      PXT: 2,
      RDN: 2,
      WETH: 11,
    };

    test('should show the right number of tokens', () => {
      const { getAllByTestId, queryAllByText } = renderPage();

      const viewAll = queryAllByText('View all');
      viewAll.forEach((el: Element) => fireEvent.click(el));

      const tokens = getAllByTestId(/auction-filter-sellTokens-item-*./);
      expect(tokens.length).toEqual(8);
    });

    test('should show the right count for each tokens', () => {
      const { getByTestId: pageGetByTestId, getAllByTestId, queryAllByText, debug } = renderPage(
        <EndedAuctions />,
      );

      const viewAll = queryAllByText('View all');
      viewAll.forEach((el: Element) => fireEvent.click(el));

      const tokens = getAllByTestId(/auction-filter-sellTokens-item*./);

      tokens.forEach(token => {
        debug(token);
        const name = getByTestId(token, /auction-filter-sellTokens-name-*./).innerHTML;
        const label = pageGetByTestId(`auction-filter-sellTokens-label-${name}`);

        fireEvent.click(label);

        const cards = getAllByTestId(/auction-card-*./);
        expect(cards.length).toEqual(cardsByToken[name]);

        fireEvent.click(label);
      });
    });

    test('should show the right number of cards for each tokens when filterng', () => {
      const { getAllByTestId, queryAllByText } = renderPage();

      const viewAll = queryAllByText('View all');
      viewAll.forEach((el: Element) => fireEvent.click(el));

      const tokens = getAllByTestId(/auction-filter-sellTokens-item*./);

      tokens.forEach(token => {
        const name = getByTestId(token, /auction-filter-sellTokens-name-*./).innerText;
        const count = getByTestId(token, /auction-filter-sellTokens-count-*./).innerText;

        expect(count).toEqual(countByToken[name]);
      });
    });
  });

  describe('Filter by bid tokens', () => {
    const countByToken: any = {
      CWBR: '1',
      DAI: '3',
      GEN: '1',
      MKR: '2',
      OMG: '3',
      PXT: '2',
      RDN: '4',
      WETH: '13',
    };

    test('should show the right number of tokens', () => {
      const { getAllByTestId, queryAllByText } = renderPage();

      const viewAll = queryAllByText('View all');

      viewAll.forEach((el: Element) => fireEvent.click(el));

      const tokens = getAllByTestId(/auction-filter-buyTokens-item-*./);
      expect(tokens.length).toEqual(8);
    });

    test('should show the right count for each tokens', () => {
      const { getAllByTestId, queryAllByText } = renderPage();

      const viewAll = queryAllByText('View all');
      viewAll.forEach((el: Element) => fireEvent.click(el));

      const tokens = getAllByTestId(/auction-filter-buyTokens-item*./);
      tokens.forEach(token => {
        const name = getByTestId(token, /auction-filter-buyTokens-name-*./).innerText;
        const count = getByTestId(token, /auction-filter-buyTokens-count-*./).innerText;

        expect(count).toEqual(countByToken[name]);
      });
    });

    test('should show the right number of cards for each tokens when filterng', () => {
      const { getAllByTestId, queryAllByText } = renderPage();

      const viewAll = queryAllByText('View all');
      viewAll.forEach((el: Element) => fireEvent.click(el));

      const tokens = getAllByTestId(/auction-filter-buyTokens-item*./);
      tokens.forEach(token => {
        const name = getByTestId(token, /auction-filter-buyTokens-name-*./).innerText;
        const count = getByTestId(token, /auction-filter-buyTokens-count-*./).innerText;

        expect(count).toEqual(countByToken[name]);
      });
    });
  });
});

describe('Auction list sorting', () => {
  test('should be initially sorted by estimated end time asc', () => {
    const { getAllByTestId } = renderPage(<RunningAuctions />);
    const cards = getAllByTestId(/auction-card-*./);

    const orderedTitles = [
      ['OMG', 'WETH'],
      ['WETH', 'OMG'],
      ['RDN', 'WETH'],
      ['WETH', 'RDN'],
      ['DAI', 'MKR'],
      ['WETH', 'MKR'],
    ]
      .map(card => `Bid with ${card[0]} to buy ${card[1]}`)
      .join(' ');

    const orderedCards = cards.map(card => getByTitle(card, /Bid with*./).title).join(' ');

    expect(orderedTitles).toEqual(orderedCards);
  });

  test('should sort auctions by estimated end time', () => {
    const { getAllByTestId, getByTestId } = renderPage(<RunningAuctions />);
    const sort = getByTestId('sortby-end-time');

    fireEvent.click(sort);

    const cards = getAllByTestId(/auction-card-*./);

    const orderedTitles = [
      ['OMG', 'WETH'],
      ['WETH', 'OMG'],
      ['RDN', 'WETH'],
      ['WETH', 'RDN'],
      ['DAI', 'MKR'],
      ['WETH', 'MKR'],
    ]
      .reverse()
      .map(card => `Bid with ${card[0]} to buy ${card[1]}`)
      .join(' ');

    const orderedCards = cards.map(card => getByTitle(card, /Bid with*./).title).join(' ');

    expect(orderedTitles).toEqual(orderedCards);
  });

  test('should sort auctions by bid token', () => {
    const { getAllByTestId, getByTestId } = renderPage(<RunningAuctions />);
    const sort = getByTestId('sortby-bid-token');
    const tokensTitles = [
      ['DAI', 'MKR'],
      ['OMG', 'WETH'],
      ['RDN', 'WETH'],
      ['WETH', 'MKR'],
      ['WETH', 'OMG'],
      ['WETH', 'RDN'],
    ].map(card => `Bid with ${card[0]} to buy ${card[1]}`);

    fireEvent.click(sort);
    let cards = getAllByTestId(/auction-card-*./);
    const orderedCards = cards.map(card => getByTitle(card, /Bid with*./).title).join(' ');
    expect(tokensTitles.join(' ')).toEqual(orderedCards);

    fireEvent.click(sort);
    cards = getAllByTestId(/auction-card-*./);

    const reverseOrderedCards = cards.map(card => getByTitle(card, /Bid with*./).title).join(' ');
    expect(tokensTitles.reverse().join(' ')).toEqual(reverseOrderedCards);
  });

  test('should sort auctions by sell volume', () => {
    const { getAllByTestId, getByTestId } = renderPage(<RunningAuctions />);
    const sort = getByTestId('sortby-sell-volume');
    const tokensTitles = [
      ['WETH', 'OMG'],
      ['OMG', 'WETH'],
      ['RDN', 'WETH'],
      ['WETH', 'MKR'],
      ['DAI', 'MKR'],
      ['WETH', 'RDN'],
    ].map(card => `Bid with ${card[0]} to buy ${card[1]}`);

    fireEvent.click(sort);

    let cards = getAllByTestId(/auction-card-*./);
    const orderedCards = cards.map(card => getByTitle(card, /Bid with*./).title).join(' ');
    expect(tokensTitles.join(' ')).toEqual(orderedCards);

    fireEvent.click(sort);
    cards = getAllByTestId(/auction-card-*./);

    const reverseOrderedCards = cards.map(card => getByTitle(card, /Bid with*./).title).join(' ');
    expect(tokensTitles.reverse().join(' ')).toEqual(reverseOrderedCards);
  });
});

function renderPage(ListContainer?: ReactElement<any>) {
  return renderWithRedux(
    <Router>
      <>
        <AuctionNavBar />
        <Filters />
        {ListContainer}
      </>
    </Router>,
    {
      blockchain: {
        auctions,
        frt,
        tokens,
      },
    },
  );
}
