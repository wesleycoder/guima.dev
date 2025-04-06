import { Icon, launchCommand, LaunchType, MenuBarExtra } from '@raycast/api';
import { useActor } from '@xstate/react';
import { fetchMachine } from './fetchMachine';

export default function main() {
  const [state] = useActor(fetchMachine);

  console.log('state', state.value);

  return (
    <MenuBarExtra
      isLoading={!state.matches('ready') || !state.matches('error')}
      title={`${state.context.messages.length}`}
      icon={Icon.SpeechBubbleActive}
    >
      {state.matches('error') && <MenuBarExtra.Item title="Error" subtitle={state.context.error ?? 'Unknown error'} />}
      {state.matches('ready') && (
        <MenuBarExtra.Item
          title="View"
          icon={Icon.List}
          onAction={() =>
            launchCommand({
              name: 'ntfy-list',
              type: LaunchType.UserInitiated,
            })
          }
        />
      )}
    </MenuBarExtra>
  );
}
