import React from 'react';
import { useObserver } from 'mobx-react';
import { useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useStore } from '../store';
import { makeStyles } from '@material-ui/styles';

const useStyles = () => {
    const theme = useTheme();
    return makeStyles({
        root: {
            display: 'flex'
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
        },
        title: {
            flexGrow: 1
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3)
        },
        toolbar: theme.mixins.toolbar
    })();
}

export default props => {
    const { children, path } = props;
    const { store: { user } } = useStore();
    const classes = useStyles();

    return useObserver(() => {
        const hideSignInSignOut = path === 'signin';
        const signIn = async event => {
            event.preventDefault();

            const { navigate } = props;
            await navigate('signin');
        };

        const signOut = event => {
            event.preventDefault();

            user.clearProfile();
        };

        return (
            <div className={classes.root} path="/">
                <AppBar
                    position="fixed"
                    className={classes.appBar}>
                    <Toolbar>
                        <Typography
                            variant="h6"
                            color="inherit"
                            noWrap
                            className={classes.title}>
                            {window.APP_CONFIG.APP_NAME}
                        </Typography>
                        {!hideSignInSignOut ? (
                            user.signedIn ? (
                                <Button
                                    color="inherit"
                                    onClick={event => signOut(event)}>
                                    Sign Out
                                </Button>
                            ) : (
                                <Button
                                    color="inherit"
                                    onClick={event => signIn(event)}>
                                    Sign In
                                </Button>
                            )
                        ) : null}
                    </Toolbar>
                </AppBar>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    {children}
                </main>
            </div>
        )
    });
};
