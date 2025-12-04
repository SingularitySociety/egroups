import React from 'react';

const PlanOptions = (props)=>{
  const { plans } = props;
  return plans.map((plan, index)=>{
    return <option key={index} value={index}>{plan.name}</option>
  });
} 

export default PlanOptions;
