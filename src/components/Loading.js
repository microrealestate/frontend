import { Box, CircularProgress } from "@material-ui/core";

const Loading = () => {

    return (
        <Box marginLeft="50%" marginTop={20}>
            <CircularProgress />
        </Box>
    );
}

export default Loading;