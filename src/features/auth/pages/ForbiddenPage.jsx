import { AccessDenied } from '../../../core/auth/AccessDenied';

export function ForbiddenPage(props) {
  return <AccessDenied {...props} />;
}
