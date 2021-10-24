import { Box, Typography } from '@material-ui/core';

import Image from 'next/image';
import getConfig from 'next/config';
import useTranslation from 'next-translate/useTranslation';

const {
  publicRuntimeConfig: { BASE_PATH },
} = getConfig();

const Illustration = ({
  imgName,
  label,
  alt,
  width = '100%',
  height = 200,
}) => (
  <>
    <Box height={height} width={width} position="relative">
      <Image
        src={`${BASE_PATH}/${imgName}.svg`}
        width={width}
        height={height}
        layout="fill"
        alt={alt}
      />
    </Box>
    {!!label && (
      <Box pt={1} color="text.disabled">
        <Typography align="center" variant="caption" component="p">
          {label}
        </Typography>
      </Box>
    )}
  </>
);

export const EmptyIllustration = ({ label }) => {
  const { t } = useTranslation();
  return (
    <Illustration
      imgName="undraw_Empty_re_opql"
      label={label || t('No data found')}
      alt="no data found"
    />
  );
};

export const LocationIllustration = ({ width, height }) => (
  <Illustration
    imgName="undraw_Location_tracking"
    alt="no location found"
    width={width}
    height={height}
  />
);

export const BlankDocumentIllustration = () => (
  <Illustration imgName="undraw_add_document_re_mbjx" alt="blank document" />
);

export const TermsDocumentIllustration = () => (
  //TODO: fill the alt attribute
  <Illustration imgName="undraw_Terms_re_6ak4" alt="" />
);

export const AlertIllustration = () => (
  //TODO: fill the alt attribute
  <Illustration imgName="undraw_Notify_re_65on" alt="" />
);

export const PendingIllustration = () => (
  //TODO: fill the alt attribute
  <Illustration imgName="undraw_pending_approval_xuu9" alt="" />
);

export const Pending2Illustration = () => (
  //TODO: fill the alt attribute
  <Illustration imgName="undraw_pending_approval2_xuu9" alt="" />
);

export const ReceiptIllustration = () => (
  <Illustration imgName="undraw_Receipt_re_fre3" alt="Invoice" />
);

export const WelcomeIllustration = ({ height = '100%' }) => (
  <Illustration
    imgName="undraw_apartment_rent_o0ut"
    height={height}
    alt="welcome"
  />
);

export const CelebrationIllustration = ({ label, height = '100%' }) => (
  <Illustration
    imgName="undraw_Celebration_re_kc9k"
    height={height}
    label={label}
    alt="celebration"
  />
);
