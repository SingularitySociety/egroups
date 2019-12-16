import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Members from './Members';

function Listing(props) {
  const { user, db, group, history, callbacks, privilege } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(() => {
    setTabbar("listing");
  }, [setTabbar]);

  const context = { user, group, db, history, privilege };
  return <Members {...context} />;
}

Listing.propTypes = {
    callbacks: PropTypes.object.isRequired,
  };
  
export default Listing;
