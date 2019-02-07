import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import { withStyles } from "@material-ui/core/styles";
import withRoot from "./withRoot";
import _ from "lodash";
import axios from "axios";

const drawerWidth = 240;
const api = axios.create({
  //  baseURL,
  timeout: 1000
});

const PAGESIZE = 10;
const RESULTSIZE = 20;

const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: theme.spacing.unit * 4
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  appBarSpacer: theme.mixins.toolbar
});

class Index extends React.Component {
  state = {
    open: false,
    results: []
  };

  search = event => {
    // CORS is workarounded though package.json proxy property for dev purporses
    // https://facebook.github.io/create-react-app/docs/proxying-api-requests-in-development
    const q = encodeURI(event.target.value);
    const setState = this.setState.bind(this);
    if (!event.target.value || !q) {
      setState({
        results: [],
        error: null
      });
    }
    //Parallel requests
    //TODO RESULTSIZE / PAGESIZE => create array of requests to make PAGESIZE a parameter and reuse this logic
    axios
      .all([api.get("/api/?p=1&q=" + q), api.get("/api/?p=2&q=" + q)])
      .then(
        axios.spread(function(r1, r2) {
          // Both requests are now complete

          setState({
            results: _.get(r1, "data.results", []).concat(
              _.get(r2, "data.results", [])
            ),
            error: null
          });
        })
      )
      .catch(error => setState({ error: JSON.stringify(error) }));
  };

  renderResults = () => {
    const { classes } = this.props;
    const { results } = this.state;

    return results.map(r => (
      <Typography
        component="h1"
        variant="h6"
        color="inherit"
        margin="normal"
        noWrap
        key={r.href}
        className={classes.grow}
      >
        {<a href={r.href}>{r.title}</a>}
      </Typography>
    ));
  };

  render() {
    const { classes } = this.props;
    const { error } = this.state;

    // Request once the user ends the typing
    const debouncedSearch = _.debounce(this.search, 500);

    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={classNames(classes.appBar)}>
          <Toolbar className={classes.toolbar}>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              margin="normal"
              noWrap
              className={classes.grow}
            >
              Recipe finder
            </Typography>
            <Button color="inherit">Home</Button>
          </Toolbar>
        </AppBar>
        <main className={classes.root}>
          <FormControl>
            <TextField
              id="outlined-search"
              label="Search for..."
              type="search"
              onChange={event => {
                //To avoid reuse of the event, better options, for speed shake  https://reactjs.org/docs/events.html#event-pooling
                event.persist();
                debouncedSearch(event);
              }}
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
          </FormControl>
          {this.renderResults()}
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            margin="normal"
            noWrap
            className={classes.grow}
          >
            {error}
          </Typography>
        </main>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withRoot(withStyles(styles)(Index));
