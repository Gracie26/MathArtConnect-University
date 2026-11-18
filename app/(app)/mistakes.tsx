import { Redirect } from 'expo-router';

/** Review Mistakes lives in Review My Work, opened on the "Needs review" filter. */
export default function MistakesScreen() {
  return <Redirect href={{ pathname: '/my-work', params: { filter: 'review' } }} />;
}
