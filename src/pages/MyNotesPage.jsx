import { Navigate } from 'react-router-dom';
import SignInRequired from '../components/SignInRequired';

export default function MyNotesPage(props) {
  if (props.user) {
    return <Navigate to="/activity?filter=mine" replace />;
  }

  return (
    <SignInRequired
      {...props}
      breadcrumb="My Notes"
      message="Sign in to write and view your notes."
    />
  );
}
