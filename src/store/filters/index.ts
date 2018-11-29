import { Reducer } from 'redux';

import * as actions from './actions';

const initialState: FiltersState = {
  sellTokens: [],
  buyTokens: [],
  sortBy: 'token',
  sortDir: 'asc',
  onlyMyTokens: false,
  onlyMyAuctions: false
};

const reducer: Reducer<FiltersState, FiltersAction> = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case actions.APPLY_FILTERS:
      return {
        ...state,
        ...payload
      };

    case actions.CLEAR_FILTERS:
      return initialState;

    default:
      return state;
  }
};

export default reducer;
