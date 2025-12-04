import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import AccessDenied from '../../common/AccessDenied';
import Members from './Members';

function Listing(props) {
  const { user, db, group, history, callbacks, privilege } = props;
  const { requirePemission, accessControll } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(() => {
    setTabbar("listing");
  }, [setTabbar]);

  if (!accessControll(requirePemission, privilege)) {
    return <AccessDenied />;
  }
  
  const context = { user, group, db, history, privilege };
  return <Members {...context} />;
}

Listing.propTypes = {
    callbacks: PropTypes.object.isRequired,
  };
  
export default Listing;
