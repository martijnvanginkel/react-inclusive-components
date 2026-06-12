import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

// Rules covered: TAB-1..TAB-12 (see REQUIREMENTS.md). Note TAB-8 wrapping and TAB-9 Home/End
// are documented enhancements beyond the source (REQUIREMENTS §14) — tested as implemented.
// TAB-13 (visible panel focus style) is CSS, verified manually; TAB-14/15 are usage guidelines.

function renderTabs() {
  return render(
    <Tabs label="Account settings" defaultValue="profile">
      <Tabs.List>
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="profile">Profile panel</Tabs.Panel>
      <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
      <Tabs.Panel value="security">Security panel</Tabs.Panel>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('TAB-1/TAB-2: a labelled tablist contains role=tab elements', () => {
    renderTabs();
    const list = screen.getByRole('tablist', { name: 'Account settings' });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('TAB-3: each tab controls a labelled tabpanel', () => {
    renderTabs();
    const tab = screen.getByRole('tab', { name: 'Profile' });
    const panel = screen.getByRole('tabpanel', { name: 'Profile' });
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('TAB-4/TAB-5: roving tabindex + aria-selected track the active tab', () => {
    renderTabs();
    const [profile, billing] = screen.getAllByRole('tab');
    expect(profile).toHaveAttribute('aria-selected', 'true');
    expect(profile).toHaveAttribute('tabindex', '0');
    expect(billing).toHaveAttribute('aria-selected', 'false');
    expect(billing).toHaveAttribute('tabindex', '-1');
  });

  it('TAB-6: only the selected panel is visible; inactive panels are hidden', () => {
    renderTabs();
    expect(screen.getByRole('tabpanel', { name: 'Profile' })).toBeVisible();
    // Inactive panel is excluded from the accessibility tree (hidden), but still in the DOM.
    expect(screen.queryByRole('tabpanel', { name: 'Billing' })).not.toBeInTheDocument();
    const billing = screen.getByText('Billing panel');
    expect(billing).toHaveAttribute('hidden');
    expect(billing).toHaveAttribute('role', 'tabpanel');
  });

  it('TAB-8: Right/Left arrows move selection (and focus), wrapping at the ends', async () => {
    const user = userEvent.setup();
    renderTabs();
    const [profile, billing, security] = screen.getAllByRole('tab');
    profile.focus();
    await user.keyboard('{ArrowRight}');
    expect(billing).toHaveAttribute('aria-selected', 'true');
    expect(billing).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}'); // security, then wrap to profile
    expect(profile).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowLeft}'); // wrap back to security
    expect(security).toHaveAttribute('aria-selected', 'true');
  });

  it('TAB-9: Home/End select first/last tab (enhancement)', async () => {
    const user = userEvent.setup();
    renderTabs();
    const [profile, , security] = screen.getAllByRole('tab');
    profile.focus();
    await user.keyboard('{End}');
    expect(security).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Home}');
    expect(profile).toHaveAttribute('aria-selected', 'true');
  });

  it('TAB-10: Down arrow moves focus into the active panel', async () => {
    const user = userEvent.setup();
    renderTabs();
    const profileTab = screen.getByRole('tab', { name: 'Profile' });
    profileTab.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('tabpanel', { name: 'Profile' })).toHaveFocus();
  });

  it('TAB-7: the active panel is programmatically focusable (tabindex=-1)', () => {
    renderTabs();
    expect(screen.getByRole('tabpanel', { name: 'Profile' })).toHaveAttribute('tabindex', '-1');
  });

  it('TAB-11/TAB-12: Tab moves into the panel content; Shift+Tab returns to the tab', async () => {
    const user = userEvent.setup();
    render(
      <Tabs label="Account settings" defaultValue="profile">
        <Tabs.List>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="profile">
          <button type="button">Edit profile</button>
        </Tabs.Panel>
        <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
      </Tabs>,
    );
    const profileTab = screen.getByRole('tab', { name: 'Profile' });
    profileTab.focus();
    // Tab (not arrows) goes to the panel's focusable content, skipping inactive tabs
    // (tabindex=-1) and the panel itself (tabindex=-1).
    await user.tab();
    expect(screen.getByRole('button', { name: 'Edit profile' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(profileTab).toHaveFocus();
  });

  it('clicking a tab selects it', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByRole('tab', { name: 'Security' }));
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Security' })).toBeVisible();
  });
});
