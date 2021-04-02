import { FormSection } from '../Form';
import { withTranslation } from '../../utils/i18n';

const OrganizationNotification = withTranslation()(({ t, onSubmit }) => {
    return (
        <FormSection label={t('Notifications')}>

        </FormSection>
    );
});

export default OrganizationNotification;