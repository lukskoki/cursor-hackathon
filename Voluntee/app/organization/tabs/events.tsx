import { Redirect } from "expo-router";

/**
 * Tab route kept so deep links / restored tab state to …/tabs/events never hit “Unmatched route”.
 * The Events tab is hidden in _layout (`href: null`). Use the dashboard “SEE ALL” modal for the list.
 */
export default function OrganizationEventsFallback() {
  return <Redirect href="/organization/tabs/dashboard" />;
}
