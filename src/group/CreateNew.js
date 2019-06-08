import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, IconButton, Button, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
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
    
    render() {
        if (creating) {
            const { createNew } = this.props;
            return (
                <form>
                <TextField onChange={this.onChange} value={value} autoFocus 
                  variant="outlined" label="Channel Name" />
                <Button variant="contained" color="primary" className={classes.button} disabled={ value.length < 3 }
                  onClick={createNew} type="submit">Create</Button>
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