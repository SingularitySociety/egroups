import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, IconButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';

const styles = theme => ({
  form:{
    width: "100%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  textField: {
    width: "90%",
  }
});

const useStyles = makeStyles(styles);

function EditableField(props) {
  const classes = useStyles();
  const refTextField = useRef(null);
  const [value, setValue] = useState(props.value);
  const [editing, setEditing] = useState(false);
  const [ignoreBlur, setIgnoreBlur] = useState(false);

  const onChange = (e) => {
    setValue(e.target.value);
    setEditing(e.target.value !== props.value);
    setIgnoreBlur(false);
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    setIgnoreBlur(true);

    await props.onSave(value);
    setEditing(false);
    refTextField.current.blur();
  }
  const onBlur = (e) => {
    if (!ignoreBlur) {
      setValue(props.value);
      setEditing(false);
    }
  }
  const onMouseDown = (e) => {
    setIgnoreBlur(true);
  }

  const { label, multiline, disabled } = props;
  return (
    <form className={classes.form}>
      <TextField label={label} value={value} variant="outlined" className={classes.textField}
        multiline={multiline} rows={2} rowsMax={6} disabled={disabled || false}
        inputRef={refTextField} onChange={onChange} onBlur={onBlur} />
      {
        editing && <React.Fragment>
        <IconButton type="submit" color="primary" size="small"
            onClick={onSubmit} onMouseDown={onMouseDown}>
          <SaveIcon />
        </IconButton>
        </React.Fragment>
      }
    </form>
  )
}

EditableField.propTypes = {
  onSave: PropTypes.func.isRequired,
};
  
export default EditableField;