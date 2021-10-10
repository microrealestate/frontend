import { Box, Typography } from '@material-ui/core';

import getConfig from 'next/config';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

const {
  publicRuntimeConfig: { BASE_PATH },
} = getConfig();

const Illustration = ({ imgName, label, width = '100%', height = '100%' }) => (
  <>
    <Image src={`${BASE_PATH}/${imgName}.svg`} width={width} height={height} />
    {!!label && (
      <Box pt={1} color="text.disabled">
        <Typography align="center" variant="caption" component="p">
          {label}
        </Typography>
      </Box>
    )}
  </>
);

export const EmptyIllustration = ({ label, width, height }) => {
  const { t } = useTranslation();
  return (
    <Illustration
      imgName="undraw_Empty_re_opql"
      label={label || t('No data found')}
      width={width}
      height={height}
    />
  );
};

export const LocationIllustration = ({ width, height }) => (
  <Illustration
    imgName="undraw_Location_tracking"
    width={width}
    height={height}
  />
);

export const BlankDocumentIllustration = ({ width, height }) => (
  <Illustration
    imgName="undraw_add_document_re_mbjx"
    width={width}
    height={height}
  />
);

export const TermsDocumentIllustration = ({ width, height }) => (
  <Illustration imgName="undraw_Terms_re_6ak4" width={width} height={height} />
);

export const AlertIllustration = ({ width, height }) => (
  <Illustration imgName="undraw_Notify_re_65on" width={width} height={height} />
);

export const PendingIllustration = ({ width, height }) => (
  <Illustration
    imgName="undraw_pending_approval_xuu9"
    width={width}
    height={height}
  />
);

export const Pending2Illustration = ({ width, height }) => (
  <Illustration
    imgName="undraw_pending_approval2_xuu9"
    width={width}
    height={height}
  />
);

export const ReceiptIllustration = ({ width, height }) => (
  <Illustration
    imgName="undraw_Receipt_re_fre3"
    width={width}
    height={height}
  />
);
