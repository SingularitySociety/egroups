import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Fab, Button, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
    form: {
        marginTop: theme.spacing(1)
    },
    button: {
        margin: theme.spacing(1)
    },
    multiline: {
        width: "100%",
        marginTop: theme.spacing(1),
    }
});

class CreateNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = { creating:props.creating || false, value:props.value || "" };
    }
    setCreatingFlag = (creating) => {
        this.setState({creating, value:""})
    }
    onChange = (e) => {
        let value = e.target.value;
        this.setState({value});
    }
    onSubmit = (e) => {
        e.preventDefault();
        this.setCreatingFlag(false);
        this.props.createNew(this.state.value);
    }
    catchReturn = (e) => {
        if (e.key==='Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.state.value.length > 0) {
                this.onSubmit(e);
            }
        }
    }
    
    render() {
        const { classes, multiline, label, action } = this.props;
        const { value, creating } = this.state;
        if (creating) {
            if (multiline) {
                return (
                    <form className={classes.form}>
                    <TextField onChange={this.onChange} value={value} autoFocus 
                      variant="outlined" label={label || "Channel Name"} 
                      multiline={true} rows={2} rowsMax={6} className={classes.multiline}
                      onKeyPress={this.catchReturn} />
                    <Button variant="contained" color="primary" className={classes.button} disabled={ value.length < 3 }
                      onClick={this.onSubmit} type="submit">{action || "Create"}</Button>
                    <Button variant="contained" className={classes.button} onClick={()=>this.setCreatingFlag(false)}>
                        <FormattedMessage id="cancel" />
                    </Button>
                  </form>
                );
            }
            return (
                <form className={classes.form}>
                <TextField onChange={this.onChange} value={value} autoFocus 
                  variant="outlined" label={label || "Channel Name"} />
                <Button variant="contained" color="primary" className={classes.button} disabled={ value.length < 3 }
                  onClick={this.onSubmit} type="submit">{action || "Create"}</Button>
                <Button variant="contained" className={classes.button} onClick={()=>this.setCreatingFlag(false)}>
                    <FormattedMessage id="cancel" />
                </Button>
              </form>
            );
        }
        return (
            <Fab variant="extended" color="primary" onClick={()=>this.setCreatingFlag(true)}>
              <AddIcon />{label}
            </Fab>
        );
    }
}

CreateNew.propTypes = {
    classes: PropTypes.object.isRequired,
    createNew: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(CreateNew);