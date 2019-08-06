import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextField, FormControl, InputLabel, Select, Button, Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import GenderOptions from '../../options/GenderOptions';
import UploadButton from '@material-ui/icons/CloudUpload';
import * as firebase from "firebase/app";
import "firebase/storage";
import Processing from '../../common/Processing';

const styles = theme => ({
  field: {
    marginBottom: theme.spacing(1),
  },
  form: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '22rem',
  },
  verification: {
    marginBottom: theme.spacing(1),
    width: '11rem',
  },
  upload: {
    marginRight: theme.spacing(1),
  },
  year: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '10rem',
  },
  month: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '5rem',
  },
  day: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '5rem',
  },
});

const person_keys = ["last_name_kanji", "last_name_kana", "first_name_kanji", "first_name_kana"];
const dob_keys = ["year", "month", "day"];
const address_keys = ["postal_code", "state", "city", "town", "line1", "line2"];
const person_keys_all = ["last_name_kana", "last_name_kanji", "first_name_kana", "first_name_kanji", "phone", "dob", "gender", "address_kanji", "address_kana"];

export function extract_personal_dataJP(person) {
  return person_keys_all.reduce((values, key) => {
    const value = person[key];
    if (value) {
      values[key] = value;
    }
    return values;
  }, {});
}

export function person_data_required(prefix, requirements) {
  let keys = [prefix+"verification.document"];
  keys = keys.concat(person_keys.map(key => prefix+key));
  keys = keys.concat(dob_keys.map(key => prefix+"dob."+key));
  keys = keys.concat(address_keys.map(key => prefix+"address_kanji."+key));
  keys = keys.concat(address_keys.map(key => prefix+"address_kana."+key));
  keys.push(prefix+"phone");
  keys.push(prefix+"gender");

  return keys.reduce((summary, key)=>{
    return summary || requirements[key];
  }, false);
}

function AccountCompanyPersonJP(props) {
  const { groupId, classes, personal_data, setPersonValue, requirements, setPage, prefix, no_opener } = props;
  const [processing, setProcessing] = useState(false);
  //console.log(requirements);

  useEffect(()=>{
    setPage("person");
  }, [setPage]);

  function onFileInput(e) {
    const file = e.target.files[0];
    const filePath = `groups/${groupId}/owner/verification/front`;
    console.log(file, filePath)
    const storagRef = firebase.storage().ref();
    const imageRef = storagRef.child(filePath);
    const task = imageRef.put(file);
    setProcessing(true);
    task.on('state_changed', (snapshot)=>{
      console.log("progress", snapshot);
    }, (error) => {
      console.log("failed", error);
      setProcessing(false);
    }, async () => {
      console.log("success");
      setProcessing(false);
    });
}
  return (<React.Fragment>
    {
      person_keys.map((key)=>{
        return <FormControl key={key} className={classes.form}>
        <TextField error={no_opener || requirements[prefix+key]} label={<FormattedMessage id={"individual."+key} />} 
              value={personal_data[key] || ""} 
              onChange={(e)=>setPersonValue(key, null, e.target.value)} />
      </FormControl>
      })      
    }
    <br/>
    <FormControl className={classes.form}>
      <InputLabel error={!personal_data["gender"]}><FormattedMessage id="gender" /></InputLabel>
      <Select native value={personal_data["gender"] || "please.specify"} onChange={(e)=>setPersonValue("gender", null, e.target.value)} >
        <GenderOptions />
      </Select>
    </FormControl>
    <br/>
    {
      dob_keys.map((key)=>{
        return <FormControl key={key} className={classes[key]}>
        <TextField label={<FormattedMessage id={"individual.dob."+key} />} 
              error={no_opener}
              value={(personal_data.dob && personal_data.dob[key]) || ""} 
              onChange={(e)=>setPersonValue("dob", key, parseInt(e.target.value) || null)} />
      </FormControl>
      })      
    }
    <br/>
    <FormControl key={"phone"} className={classes.form}>
        <TextField error={no_opener || requirements[prefix+"phone"]} label={<FormattedMessage id={"individual.phone"} />} 
              value={personal_data["phone"] || ""} 
              onChange={(e)=>setPersonValue("phone", null, e.target.value)} />
    </FormControl>
    <br/>
    {
      address_keys.map((subkey)=>{
        if (subkey==="postal_code") {
          return false; // no need to show Kanji version of postal code
        }
        const ckey="address_kanji."+subkey;
        return <FormControl key={ckey} className={classes.form}>
        <TextField error={no_opener || requirements[prefix+ckey]} label={<FormattedMessage id={ckey} />} 
              value={(personal_data["address_kanji"]||{})[subkey] || ""} 
              onChange={(e)=>setPersonValue("address_kanji", subkey, e.target.value)} />
      </FormControl>
      })      
    }
    {
      address_keys.map((subkey)=>{
        const ckey="address_kana."+subkey;
        return <FormControl key={ckey} className={classes.form}>
        <TextField error={no_opener || requirements[prefix+ckey]} label={<FormattedMessage id={ckey} />} 
              value={(personal_data["address_kana"]||{})[subkey] || ""} 
              onChange={(e)=>setPersonValue("address_kana", subkey, e.target.value)} />
      </FormControl>
      })      
    }
    <br/>
    {
      requirements[prefix+"verification.document"] && 
      <div>
        <FormControl className={classes.verification} >
          <Button variant="contained" component="label">
            <UploadButton className={classes.upload}/>
            <Typography color={ requirements[prefix+"verification.document"] ? "error" : "inherit"}>
              <FormattedMessage id="verification.document" />
            </Typography>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput} />
          </Button>
        </FormControl>
        <Processing active={processing} />
      </div>
    }

    </React.Fragment>)
}

AccountCompanyPersonJP.propTypes = {
  classes: PropTypes.object.isRequired,
  personal_data: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setPersonValue: PropTypes.func.isRequired,
  groupId: PropTypes.string.isRequired,
  setPage: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountCompanyPersonJP);