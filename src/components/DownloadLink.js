import { downloadDocument } from '../utils/fetch';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';
import { Box, IconButton, Link, Typography } from '@material-ui/core';


const DownloadLink = ({ label, url, withIcon = false, documentName, ...props }) => {
    const onClick = () => downloadDocument(url, documentName);

    return (
        <>
            {!withIcon && label && (
                <Link component="button" variant={props.variant} onClick={onClick}>
                    <Typography {...props}>{label}</Typography>
                </Link>
            )}
            {withIcon && (
                <Box>
                    {label && <Typography {...props}>{label}</Typography>}
                    <IconButton size="small"
                        onClick={onClick}
                        aria-label="download">
                        <VerticalAlignBottomIcon fontSize="inherit" />
                    </IconButton>
                </Box>
            )}
        </>
    )
}

export default DownloadLink;