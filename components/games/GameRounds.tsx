import { ArrowDown, ArrowUp, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MathText } from '@/components/math/MathText';
import { MathInput } from '@/components/practice/MathInput';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  type CardFace,
  evaluateInput,
  evaluateMatch,
  evaluateOrder,
  evaluateSelect,
  evaluateStage,
  type Evaluation,
  type Round,
  shuffled,
} from '@/lib/games/engine';

import { CardContent, GameCard } from './GameParts';

/** Every round reports each checked answer; the shell scores and moves on. */
export interface RoundProps<K extends Round['kind']> {
  round: Extract<Round, { kind: K }>;
  /** Locked after the round (or stage) is solved, until the learner moves on. */
  locked: boolean;
  onResult: (evaluation: Evaluation) => void;
}

const plain = (card: CardFace) => card.text?.replace(/\$/g, '') ?? card.tex ?? '';

export function SelectRound({ round, locked, onResult }: RoundProps<'select'>) {
  const theme = useAppTheme();
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => {
    if (locked) return;
    if (!round.multiple) {
      setSelected([id]);
      onResult(evaluateSelect(round, [id]));
      return;
    }
    setSelected((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));
  };
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {round.multiple ? (
        <AppText variant="small" color="textSecondary">
          Select every valid answer, then check.
        </AppText>
      ) : null}
      {round.choices.map((choice) => (
        <GameCard
          key={choice.id}
          item={choice}
          selected={selected.includes(choice.id)}
          disabled={locked}
          badge={selected.includes(choice.id) ? '✓' : undefined}
          label={`${plain(choice)}${selected.includes(choice.id) ? ', selected' : ''}`}
          onPress={() => toggle(choice.id)}
        />
      ))}
      {round.multiple ? (
        <LoadingButton
          label="Check"
          disabled={locked || selected.length === 0}
          onPress={() => onResult(evaluateSelect(round, selected))}
        />
      ) : null}
    </View>
  );
}

export function OrderRound({ round, locked, onResult }: RoundProps<'order'>) {
  const theme = useAppTheme();
  const pool = shuffled([...round.cards, ...(round.distractors ?? [])], round.prompt);
  const [sequence, setSequence] = useState<string[]>([]);
  const byId = new Map(pool.map((c) => [c.id, c]));
  const move = (index: number, delta: number) =>
    setSequence((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target] as string, next[index] as string];
      return next;
    });
  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="small" color="textSecondary">
        Tap the cards in the order you would use them. Leave out any card that does not belong.
      </AppText>
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          Your order
        </AppText>
        {sequence.length === 0 ? (
          <AppText variant="small" color="textMuted">
            No cards placed yet.
          </AppText>
        ) : null}
        {sequence.map((id, index) => {
          const card = byId.get(id);
          if (!card) return null;
          return (
            <View
              key={id}
              style={[
                styles.placed,
                { borderColor: theme.colors.primary, borderRadius: theme.radius.md, gap: theme.spacing.sm },
              ]}
            >
              <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.bold }}>
                {String(index + 1)}
              </AppText>
              <CardContent item={card} />
              <IconButton label={`Move step ${index + 1} up`} onPress={() => move(index, -1)} disabled={locked}>
                <ArrowUp size={16} color={theme.colors.primary} />
              </IconButton>
              <IconButton label={`Move step ${index + 1} down`} onPress={() => move(index, 1)} disabled={locked}>
                <ArrowDown size={16} color={theme.colors.primary} />
              </IconButton>
              <IconButton
                label={`Remove step ${index + 1}`}
                onPress={() => setSequence((current) => current.filter((s) => s !== id))}
                disabled={locked}
              >
                <X size={16} color={theme.colors.textSecondary} />
              </IconButton>
            </View>
          );
        })}
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          Cards
        </AppText>
        {pool
          .filter((c) => !sequence.includes(c.id))
          .map((card) => (
            <GameCard
              key={card.id}
              item={card}
              selected={false}
              disabled={locked}
              label={`Add: ${plain(card)}`}
              onPress={() => setSequence((current) => [...current, card.id])}
            />
          ))}
      </View>
      <LoadingButton
        label="Check order"
        disabled={locked || sequence.length === 0}
        onPress={() => onResult(evaluateOrder(round, sequence))}
      />
    </View>
  );
}

function IconButton({
  label,
  onPress,
  disabled,
  children,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        minWidth: theme.touchTarget.min,
        minHeight: theme.touchTarget.min,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Pressable>
  );
}

export function MatchRound({ round, locked, onResult }: RoundProps<'match'>) {
  const theme = useAppTheme();
  const [pairing, setPairing] = useState<Record<string, string>>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const rights = shuffled(round.pairs, round.prompt).map((p) => ({ id: p.id, card: p.right }));
  const leftOf = (rightId: string) => Object.entries(pairing).find(([, r]) => r === rightId)?.[0];
  const leftIndex = (leftId: string) => round.pairs.findIndex((p) => p.id === leftId) + 1;
  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="small" color="textSecondary">
        Tap an item on the left, then its match on the right. Tap a pair again to undo it.
      </AppText>
      <View style={{ gap: theme.spacing.sm }}>
        {round.pairs.map((pair, index) => (
          <GameCard
            key={pair.id}
            item={pair.left}
            selected={activeLeft === pair.id}
            disabled={locked}
            badge={`${index + 1}`}
            label={`Item ${index + 1}: ${plain(pair.left)}${pairing[pair.id] ? ', matched' : ''}`}
            onPress={() => {
              if (pairing[pair.id]) {
                setPairing(({ [pair.id]: _removed, ...rest }) => rest);
                return;
              }
              setActiveLeft(pair.id);
            }}
          />
        ))}
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          Matches
        </AppText>
        {rights.map(({ id, card }) => {
          const matchedLeft = leftOf(id);
          return (
            <GameCard
              key={id}
              item={card}
              selected={matchedLeft !== undefined}
              disabled={locked || (activeLeft === null && matchedLeft === undefined)}
              badge={matchedLeft ? `${leftIndex(matchedLeft)}` : undefined}
              label={`${plain(card)}${matchedLeft ? `, matched with item ${leftIndex(matchedLeft)}` : ''}`}
              onPress={() => {
                if (matchedLeft) {
                  setPairing(({ [matchedLeft]: _removed, ...rest }) => rest);
                  return;
                }
                if (!activeLeft) return;
                setPairing((current) => ({ ...current, [activeLeft]: id }));
                setActiveLeft(null);
              }}
            />
          );
        })}
      </View>
      <LoadingButton
        label="Check matches"
        disabled={locked || Object.keys(pairing).length < round.pairs.length}
        onPress={() => onResult(evaluateMatch(round, pairing))}
      />
    </View>
  );
}

export function StagesRound({ round, stageIndex, locked, onResult }: RoundProps<'stages'> & { stageIndex: number }) {
  const theme = useAppTheme();
  const [picked, setPicked] = useState<{ stage: number; id: string } | null>(null);
  const stage = round.stages[stageIndex];
  if (!stage) return null;
  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={[styles.stageRow, { gap: theme.spacing.xs }]}>
        {round.stages.map((s, i) => (
          <View
            key={s.label}
            style={[
              styles.stageChip,
              {
                borderRadius: theme.radius.pill,
                backgroundColor:
                  i < stageIndex
                    ? theme.colors.successSoft
                    : i === stageIndex
                      ? theme.colors.primarySoft
                      : theme.colors.surfaceMuted,
              },
            ]}
          >
            <AppText variant="small" color={i === stageIndex ? 'primary' : 'textSecondary'}>
              {`${i + 1}. ${s.label}${i < stageIndex ? ' ✓' : ''}`}
            </AppText>
          </View>
        ))}
      </View>
      <MathText text={stage.question} variant="bodyLarge" />
      {stage.choices.map((choice) => {
        const isPicked = picked?.stage === stageIndex && picked.id === choice.id;
        return (
          <GameCard
            key={`${stageIndex}-${choice.id}`}
            item={choice}
            selected={isPicked}
            disabled={locked}
            label={`${plain(choice)}${isPicked ? ', selected' : ''}`}
            onPress={() => {
              setPicked({ stage: stageIndex, id: choice.id });
              onResult(evaluateStage(round, stageIndex, choice.id));
            }}
          />
        );
      })}
    </View>
  );
}

export function InputRound({ round, locked, onResult }: RoundProps<'input'>) {
  const theme = useAppTheme();
  const [answer, setAnswer] = useState('');
  return (
    <View style={{ gap: theme.spacing.md }}>
      <MathInput
        label="Your answer"
        value={answer}
        onChangeText={setAnswer}
        placeholder={round.placeholder ?? 'e.g. x^2 + C'}
      />
      <LoadingButton
        label="Check answer"
        disabled={locked || answer.trim().length === 0}
        onPress={() => {
          const result = evaluateInput(round, answer);
          onResult(result);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placed: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingLeft: 12, paddingVertical: 4 },
  stageRow: { flexDirection: 'row', flexWrap: 'wrap' },
  stageChip: { paddingHorizontal: 10, paddingVertical: 4 },
});
