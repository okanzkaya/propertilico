import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const SidebarWrapper = styled.div`
  width: 200px;
  background-color: #f4f4f4;
  padding: 1rem;
`;

const NavList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 1rem 0;
`;

const NavLinkStyled = styled(NavLink)`
  text-decoration: none;
  color: #333;

  &.active {
    font-weight: bold;
  }
`;

const Sidebar = () => {
  return (
    <SidebarWrapper>
      <nav>
        <NavList>
          <NavItem><NavLinkStyled to="/dashboard/finances" activeClassName="active">Finances</NavLinkStyled></NavItem>
          <NavItem><NavLinkStyled to="/dashboard/properties" activeClassName="active">Properties</NavLinkStyled></NavItem>
          <NavItem><NavLinkStyled to="/dashboard/tickets" activeClassName="active">Tickets</NavLinkStyled></NavItem>
          <NavItem><NavLinkStyled to="/dashboard/contacts" activeClassName="active">Contacts</NavLinkStyled></NavItem>
          <NavItem><NavLinkStyled to="/dashboard/taxes" activeClassName="active">Taxes</NavLinkStyled></NavItem>
          <NavItem><NavLinkStyled to="/dashboard/documents" activeClassName="active">Documents</NavLinkStyled></NavItem>
          <NavItem><NavLinkStyled to="/dashboard/reports" activeClassName="active">Reports</NavLinkStyled></NavItem>
          <NavItem><NavLinkStyled to="/dashboard/settings" activeClassName="active">Settings</NavLinkStyled></NavItem>
        </NavList>
      </nav>
    </SidebarWrapper>
  );
};

export default Sidebar;
