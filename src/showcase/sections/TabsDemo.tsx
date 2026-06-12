import { Tabs } from '../../lib';

export function TabsDemo() {
  return (
    <>
      <p className="note">
        Roving tabindex with <code>role="tablist/tab/tabpanel"</code>. Left/Right (and Home/End)
        move selection; Down arrow moves focus into the active panel.
      </p>

      <Tabs label="Account settings" defaultValue="profile">
        <Tabs.List>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
          <Tabs.Tab value="security">Security</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="profile">
          <p>Your public profile — name, avatar, bio. Try arrow keys on the tabs.</p>
        </Tabs.Panel>
        <Tabs.Panel value="billing">
          <p>Manage your plan and payment methods.</p>
        </Tabs.Panel>
        <Tabs.Panel value="security">
          <p>Password and two-factor settings.</p>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
