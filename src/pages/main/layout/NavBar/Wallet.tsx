import { rem } from 'polished';
import React from 'react';
import { connect } from 'react-redux';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import Icon from '../../../../components/icons';
import { toggleFilters, toggleSidebar } from '../../../../store/ui/actions';
import ActionBar from '../ActionBar';
import HideZeroBalance from './HideZeroBalance';
import WalletSearch from './WalletSearch';

type NavBarProps = DispatchProps & RouteComponentProps;

interface DispatchProps {
  actions: {
    toggleSidebar: typeof toggleSidebar;
    toggleFilters: typeof toggleFilters;
  };
}

const NavBar = ({ actions }: NavBarProps) => (
  <Container>
    <LeftAction>
      <ToggleSidebar onClick={actions.toggleSidebar} />
      <ActionSearch searchText={''} onSearch={} />
    </LeftAction>
    <RightAction>
      <Sorting>
        <div>SORTING</div>
      </Sorting>
      <ActionSearch searchText={''} onSearch={} />
    </RightAction>
    <HideWrapper>
      <HideZeroBalance onChange={} />
    </HideWrapper>
  </Container>
);

const Container = styled.nav`
  padding: 0 var(--spacing-normal);
  background-color: transparent;
  border-bottom: 1px solid var(--color-border);
  display: grid;
  grid-template-columns: 1fr 1fr ${rem('145px')};
  grid-template-rows: var(--header-height);

  transition: background-color var(--animation-duration) ease;

  @media (max-width: 800px) {
    border-bottom: 0;
    padding: 0;
    background-color: var(--color-main-bg);
    grid-template-columns: 1fr 8fr;
    grid-template-rows: var(--header-height) var(--header-height);
  }
`;

const ToggleSidebar = styled(Icon.Menu)``;

const ActionSearch = styled(WalletSearch)`
  display: flex;
  height: var(--header-height);
  align-items: center;
`;

const Sorting = styled.div`
  display: flex;
  justify-content: space-around;
`;

const HideWrapper = styled(ActionBar)`
  @media (max-width: 800px) {
    background-color: var(--color-content-bg);
    grid-column: 1 / 3;
    padding-left: var(--spacing-normal);
  }
`;

const LeftAction = styled(ActionBar)`
  @media (max-width: 800px) {
    padding-left: var(--spacing-normal);
    border-bottom: 1px solid var(--color-border);
  }

  ${ToggleSidebar} {
    cursor: pointer;
    user-select: none;

    @media (min-width: 801px) {
      display: none;
    }
  }

  ${ActionSearch} {
    @media (max-width: 800px) {
      display: none;
    }
  }
`;

const RightAction = styled(ActionBar)`
  justify-content: flex-end;
  position: relative;

  @media (max-width: 800px) {
    padding-right: var(--spacing-normal);
    border-bottom: 1px solid var(--color-border);

    ${Sorting} {
      position: absolute;
      left: 50%;
      transform: translateX(calc(-50% - var(--spacing-normal)));
    }
  }

  ${ActionSearch} {
    position: absolute;
    right: var(--spacing-normal);
    @media (min-width: 801px) {
      display: none;
    }
  }
`;

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    actions: {
      toggleSidebar: () => dispatch(toggleSidebar()),
      toggleFilters: () => dispatch(toggleFilters()),
    },
  };
}

export default withRouter(
  connect(
    null,
    mapDispatchToProps,
  )(NavBar),
);
