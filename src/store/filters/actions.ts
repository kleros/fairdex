import { Action, ActionCreator } from 'redux';

export interface FiltersAction extends Action<string> {
  payload?: Partial<FiltersState>;
}

export const APPLY_FILTERS = 'filters/apply';
export const CLEAR_FILTERS = 'filters/clear';

export const applyFilters: ActionCreator<FiltersAction> = (filters: Partial<FiltersState>) => {
  return {
    type: APPLY_FILTERS,
    payload: filters
  };
};

export const clearFilters: ActionCreator<FiltersAction> = () => {
  return {
    type: CLEAR_FILTERS
  };
};
