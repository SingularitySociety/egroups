import React from 'react';
import { injectIntl } from 'react-intl';

const colors = ["red", "pink", "purple", "deepPurple", "indigo", "blue", "lightBlue", "cyan", "teal", "green", 
                "lightGreen", "lime", "yellow", "amber", "orange", "deepOrange", "brown", "grey", "blueGrey"];
const ColorOptions = (props)=>{
  const { messages } = props.intl;
  return (<React.Fragment>
    { colors.map((color)=>{
      return <option key={color} value={color}>{messages[color]}</option>
    })}
  </React.Fragment>);
} 

export default injectIntl(ColorOptions);