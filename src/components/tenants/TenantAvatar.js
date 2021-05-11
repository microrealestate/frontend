import { memo, useMemo } from 'react';
import { Avatar } from '@material-ui/core';

const TenantAvatar = memo(({ tenant, className }) => {
	const avatar = useMemo(() => tenant.name
		.split(' ')
		.reduce((acc, w, index) => {
			if (index < 2) {
				acc.push(w);
			}
			return acc;
		}, [])
		.filter(n => !!n)
		.map(n => n[0])
		.join(''),
		[]);

	return (
		<Avatar className={className}>{avatar}</Avatar>
	);
});

export default TenantAvatar;