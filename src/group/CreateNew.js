import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Button, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
    button: {
        margin: theme.spacing(1)
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
    
    render() {
        const { classes } = this.props;
        const { value, creating } = this.state;
        if (creating) {
            return (
                <form>
                <TextField onChange={this.onChange} value={value} autoFocus 
                  variant="outlined" label="Channel Name" />
                <Button variant="contained" color="primary" className={classes.button} disabled={ value.length < 3 }
                  onClick={this.onSubmit} type="submit">Create</Button>
                <Button variant="contained" className={classes.button} onClick={()=>this.setCreatingFlag(false)}>Cancel</Button>
              </form>
            );
        }
        return (
            <IconButton variant="contained" onClick={()=>this.setCreatingFlag(true)}>
              <AddIcon />
            </IconButton>
        );
    }
}

CreateNew.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(CreateNew);