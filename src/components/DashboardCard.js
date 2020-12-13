import { Box, Divider, Paper, Typography } from "@material-ui/core";
import { dangerCardHeader, infoCardHeader, successCardHeader, warningCardHeader, whiteColor } from "../styles/styles";
import IconTypography from "./IconTypography";

const DashboardCard = ({ variant, Icon, title, info, children }) => {
    let iconBackgroundColor;
    switch (variant) {
        case 'success':
            iconBackgroundColor = successCardHeader;
            break;
        case 'warning':
            iconBackgroundColor = warningCardHeader;
            break;
        case 'danger':
            iconBackgroundColor = dangerCardHeader;
            break;
        default:
            iconBackgroundColor = infoCardHeader;
    }

    return (
        <Paper style={{
            display: 'flex',
            marginTop: 16
        }}>
            <Box
                mx={2}
                width="100%"
            >
                <Box
                    p={1}
                    mt={-2}
                    borderRadius={3}
                    color={whiteColor}
                    style={{
                        ...iconBackgroundColor
                    }}
                >
                    <IconTypography Icon={Icon} /*fontSize="large"*/>{title}</IconTypography>
                </Box>

                <Box p={2}>
                    {children}
                </Box>
                {info && (
                    <>
                        <Divider />
                        <Box p={1}>
                            <Typography component="div" color="textSecondary" variant="caption">{info}</Typography>
                        </Box>
                    </>
                )}
            </Box>
        </Paper>
    )
}

export default DashboardCard;