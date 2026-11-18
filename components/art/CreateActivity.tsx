import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { activityTypeLabel } from '@/components/activities/ActivityList';
import { FormError } from '@/components/forms/FormError';
import { ScrollLockContext } from '@/components/graph/ScrollLock';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { getTopic } from '@/content/registry';
import type { TopicActivity } from '@/content/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { recordStudyDay } from '@/features/learning/useLearningHistory';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  type AreaArtProject,
  type AreaStudioConfig,
  layerSummary,
  projectFromTemplate,
  templateById,
} from '@/lib/art/areaArt';
import {
  newPaProject,
  normalisePaProject,
  type PaArtProject,
  paArtSummary,
  type PaStudioConfig,
} from '@/lib/art/paArt';
import {
  newRnProject,
  normaliseRnProject,
  type RnArtProject,
  rnArtSummary,
  type RnStudioConfig,
} from '@/lib/art/rnArt';
import { type FlowConfig, type FlowProject, newFlowProject } from '@/lib/graph/flow';
import type { ArtProject } from '@/lib/graph/project';
import { describeRestriction } from '@/lib/graph/sample';
import type { SavedComposition, StudioConfig } from '@/lib/graph/studio';
import { newId } from '@/lib/utils/id';
import { artProjectRepository } from '@/services/repositories/learning';
import type { ArtProjectRecord } from '@/services/repositories/types';
import type { Json } from '@/services/supabase/database.types';

import { AreaArtStudio } from './area/AreaArtStudio';
import { EquationArtStudio, type SaveStatus } from './EquationArtStudio';
import { FlowComposer } from './FlowComposer';
import { PaArtStudio } from './pa/PaArtStudio';
import { RnArtStudio } from './rn/RnArtStudio';

type Editing =
  | { id: string; graph: ArtProject; presetId?: string }
  | { id: string; flow: FlowProject }
  | { id: string; area: AreaArtProject }
  | { id: string; rn: RnArtProject }
  | { id: string; pa: PaArtProject };

/** The saved form: the full project plus readable summary fields. */
function composition(activity: TopicActivity, editing: Editing): SavedComposition {
  if ('pa' in editing) {
    const p = editing.pa;
    return {
      version: 1,
      kind: 'pa',
      subtopicId: activity.unitId,
      activityType: activity.createType ?? 'paArt',
      project: p,
      equations: paArtSummary(p),
      parameters: [],
      restrictions: [],
      canvasState: { studio: p.studio, course: p.course, creative: p.creative },
      learnerExplanation: p.explanation,
    };
  }
  if ('rn' in editing) {
    const p = editing.rn;
    return {
      version: 1,
      kind: 'rn',
      subtopicId: activity.unitId,
      activityType: activity.createType ?? 'rnArt',
      project: p,
      equations: rnArtSummary(p),
      parameters: [],
      restrictions: [],
      canvasState: {
        studio: p.studio,
        view: p.view,
        layers: p.layers.map((l) => ({ name: l.name, visible: l.visible, course: l.course, creative: l.creative })),
      },
      learnerExplanation: p.explanation,
    };
  }
  if ('area' in editing) {
    const p = editing.area;
    return {
      version: 1,
      kind: 'area',
      subtopicId: activity.unitId,
      activityType: activity.createType ?? 'areaArt',
      project: p,
      equations: p.layers.map(layerSummary),
      parameters: [],
      restrictions: [],
      canvasState: { view: p.view, backdrop: p.backdrop, templateId: p.templateId ?? null },
      learnerExplanation: p.explanation,
    };
  }
  if ('graph' in editing) {
    const p = editing.graph;
    return {
      version: 1,
      kind: 'graph',
      subtopicId: activity.unitId,
      activityType: activity.createType ?? 'graphArt',
      project: p,
      equations: p.layers.map((l) => `${l.kind === 'polar' ? 'r' : 'y'} = ${l.expression}`),
      parameters: p.parameters.map(({ name, value, min, max, step }) => ({ name, value, min, max, step })),
      restrictions: p.layers.map((l) => describeRestriction(l)).filter(Boolean),
      canvasState: p.view,
      learnerExplanation: p.math.explanation,
    };
  }
  const f = editing.flow;
  return {
    version: 1,
    kind: 'flow',
    subtopicId: activity.unitId,
    activityType: activity.createType ?? 'structure',
    project: f,
    equations: [],
    parameters: [],
    restrictions: [],
    canvasState: { layout: f.layout, accent: f.accent, dashedLinks: f.dashedLinks, placed: f.placed },
    learnerExplanation: f.math.explanation,
  };
}

/** Reads a saved composition back into an editable project, if it matches this activity's kind. */
function restore(record: ArtProjectRecord): Editing | null {
  const saved = record.composition as unknown as Partial<SavedComposition> | null;
  if (!saved || saved.version !== 1 || !saved.project) return null;
  if (saved.kind === 'graph') return { id: record.id, graph: saved.project as ArtProject };
  if (saved.kind === 'flow') return { id: record.id, flow: saved.project as FlowProject };
  if (saved.kind === 'area') return { id: record.id, area: saved.project as AreaArtProject };
  if (saved.kind === 'rn') {
    const rn = normaliseRnProject(saved.project);
    return rn ? { id: record.id, rn } : null;
  }
  if (saved.kind === 'pa') {
    const pa = normalisePaProject(saved.project);
    return pa ? { id: record.id, pa } : null;
  }
  return null;
}

const titleOf = (editing: Editing) =>
  'graph' in editing
    ? editing.graph.title
    : 'flow' in editing
      ? editing.flow.title
      : 'rn' in editing
        ? editing.rn.title
        : 'pa' in editing
          ? editing.pa.title
          : editing.area.title;

/** The same project under a new title (for duplicates). */
function retitled(editing: Editing, title: string): Editing {
  if ('graph' in editing) return { id: editing.id, graph: { ...editing.graph, title } };
  if ('flow' in editing) return { id: editing.id, flow: { ...editing.flow, title } };
  if ('rn' in editing) return { id: editing.id, rn: { ...editing.rn, title } };
  if ('pa' in editing) return { id: editing.id, pa: { ...editing.pa, title } };
  return { id: editing.id, area: { ...editing.area, title } };
}

/** A fresh, unsaved project: the activity's starter artwork (or first flow example). */
function starterFor(
  activity: TopicActivity,
  studio?: StudioConfig,
  flow?: FlowConfig,
  area?: AreaStudioConfig,
  rn?: RnStudioConfig,
  pa?: PaStudioConfig,
): Editing | null {
  if (pa) return { id: newId(), pa: newPaProject(pa, activity.title) };
  if (rn) return { id: newId(), rn: newRnProject(rn, activity.title) };
  if (area) {
    const template = templateById(area.starter);
    return template ? { id: newId(), area: projectFromTemplate(template, activity.title) } : null;
  }
  if (studio) {
    const starter = studio.starter();
    return {
      id: newId(),
      graph: { ...starter, title: activity.title },
      presetId: studio.presets.find((p) => p.project === starter)?.id,
    };
  }
  if (flow) return { id: newId(), flow: newFlowProject(flow, activity.title) };
  return null;
}

/**
 * A Create activity. It opens straight onto a starter artwork in the Equation
 * Art Studio (graph art) or the Flow Composer (structure maps and solution
 * flows); saved projects can be reopened, duplicated or deleted from
 * "My saved projects".
 */
export function CreateActivity({ activity, projectId }: ActivityProps) {
  const theme = useAppTheme();
  const { user } = useAuth();
  const topic = getTopic(activity.topicId);
  const studio = topic?.studios?.[activity.id];
  const flow = topic?.flows?.[activity.id];
  const area = topic?.areaStudios?.[activity.id];
  const rn = topic?.rnStudios?.[activity.id];
  const pa = topic?.paStudios?.[activity.id];
  const [projects, setProjects] = useState<ArtProjectRecord[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(() =>
    projectId ? null : starterFor(activity, studio, flow, area, rn, pa),
  );
  const [save, setSave] = useState<SaveStatus>({ status: 'idle' });
  const [deleting, setDeleting] = useState<ArtProjectRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [openedParam, setOpenedParam] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  // While a finger is on the canvas the page does not scroll (Android would otherwise take the drag).
  const [scrollLocked, setScrollLocked] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const result = await artProjectRepository.list(user.id, activity.topicId);
    if (!result.ok) {
      setListError(result.error.message);
      setProjects([]);
      return;
    }
    const mine = result.data.filter((p) => p.activityId === activity.id);
    setProjects(mine);
    setListError(null);
    if (projectId && !openedParam) {
      setOpenedParam(true);
      const record = mine.find((p) => p.id === projectId);
      const restored = record ? restore(record) : null;
      if (restored) setEditing(restored);
      else {
        setListError('That saved project could not be found, so a starter artwork was opened instead.');
        setEditing(starterFor(activity, studio, flow, area, rn, pa));
      }
    }
  }, [user, activity, projectId, openedParam, studio, flow, area, rn, pa]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!studio && !flow && !area && !rn && !pa) return null;

  const open = (next: Editing | null) => {
    if (!next) return;
    setSave({ status: 'idle' });
    setEditing(next);
    setProjectsOpen(false);
  };

  const persist = async (next: Editing, completed: boolean) => {
    if (!user) {
      setSave({ status: 'error', message: 'Sign in to save your work.' });
      return;
    }
    setSave({ status: 'saving' });
    const result = await artProjectRepository.save(user.id, {
      id: next.id,
      topicId: activity.topicId,
      activityId: activity.id,
      title: titleOf(next).trim() || activity.title,
      composition: composition(activity, next) as unknown as Json,
      isCompleted: completed,
    });
    setSave(result.ok ? { status: 'saved' } : { status: 'error', message: result.error.message });
    if (result.ok) {
      void load();
      // Saving artwork is study: it counts towards the streak (no XP).
      void recordStudyDay(user.id, 'art', activity.topicId).catch(() => undefined);
    }
  };

  const duplicate = async (record: ArtProjectRecord) => {
    if (!user) return;
    setBusy(true);
    const restored = restore(record);
    const copy: Editing | null = restored ? retitled(restored, `${titleOf(restored)} (copy)`) : null;
    const result = await artProjectRepository.save(user.id, {
      id: newId(),
      topicId: record.topicId,
      activityId: record.activityId,
      title: `${record.title} (copy)`.slice(0, 120),
      composition: copy ? (composition(activity, copy) as unknown as Json) : record.composition,
      isCompleted: record.isCompleted,
    });
    setBusy(false);
    if (!result.ok) setListError(result.error.message);
    void load();
  };

  const remove = async () => {
    if (!user || !deleting) return;
    setBusy(true);
    const result = await artProjectRepository.remove(user.id, deleting.id);
    setBusy(false);
    setDeleting(null);
    if (!result.ok) setListError(result.error.message);
    void load();
  };

  const savedCount = projects?.length ?? 0;

  return (
    <ScrollLockContext.Provider value={setScrollLocked}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          contentContainerStyle={{ padding: theme.layout.screenGutter, paddingBottom: theme.spacing.huge }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          scrollEnabled={!scrollLocked}
        >
          <View style={[styles.column, { maxWidth: theme.layout.maxContentWidth, gap: theme.spacing.lg }]}>
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="eyebrow" color="textSecondary">
                {`CREATE · ${activityTypeLabel(activity).toUpperCase()}`}
              </AppText>
              <AppText variant="h1">{activity.title}</AppText>
              <MathText text={activity.summary} variant="bodyLarge" color="textSecondary" />
            </View>

            <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
              <Pressable
                onPress={() => setProjectsOpen((o) => !o)}
                accessibilityRole="button"
                accessibilityState={{ expanded: projectsOpen }}
                accessibilityLabel={`My saved projects, ${savedCount}`}
                style={[styles.headerRow, { minHeight: theme.touchTarget.min }]}
              >
                <AppText variant="title">{`My saved projects (${projects === null ? '…' : savedCount})`}</AppText>
                <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                  {projectsOpen ? 'Hide' : 'Show'}
                </AppText>
              </Pressable>
              <FormError message={listError} />
              {projectsOpen ? (
                <View style={{ gap: theme.spacing.sm }}>
                  <LoadingButton
                    variant="secondary"
                    label="Start a new project from the starter"
                    onPress={() => open(starterFor(activity, studio, flow, area, rn, pa))}
                  />
                  {projects === null ? <Skeleton height={80} radius={theme.radius.card} /> : null}
                  {projects?.length === 0 ? (
                    <AppText variant="small" color="textSecondary">
                      No saved projects yet. Save the artwork below to keep it.
                    </AppText>
                  ) : null}
                  {projects?.map((record) => (
                    <View
                      key={record.id}
                      style={[
                        styles.saved,
                        { borderColor: theme.colors.border, borderRadius: theme.radius.md, gap: theme.spacing.sm },
                      ]}
                    >
                      <AppText variant="title">{record.title}</AppText>
                      <AppText variant="small" color="textSecondary">
                        {`${record.isCompleted ? 'Completed' : 'In progress'} · updated ${new Date(record.updatedAt).toLocaleDateString()}`}
                      </AppText>
                      <View style={[styles.actions, { gap: theme.spacing.sm }]}>
                        <LoadingButton
                          label="Open"
                          onPress={() => {
                            const restored = restore(record);
                            if (restored) open(restored);
                            else setListError('This project could not be opened.');
                          }}
                          style={styles.grow}
                        />
                        <LoadingButton
                          variant="secondary"
                          label="Duplicate"
                          disabled={busy}
                          onPress={() => void duplicate(record)}
                          style={styles.grow}
                        />
                        <LoadingButton
                          variant="secondary"
                          label="Delete"
                          disabled={busy}
                          onPress={() => setDeleting(record)}
                          style={styles.grow}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {editing === null ? <Skeleton height={320} radius={theme.radius.card} /> : null}
            {editing && 'graph' in editing && studio ? (
              <EquationArtStudio
                key={editing.id}
                config={studio}
                initial={editing.graph}
                presetId={editing.presetId}
                title={editing.graph.title}
                saveStatus={save}
                onSave={(graph, completed) => {
                  const next = { id: editing.id, graph };
                  setEditing(next);
                  void persist(next, completed);
                }}
              />
            ) : null}
            {editing && 'area' in editing && area ? (
              <AreaArtStudio
                key={editing.id}
                config={area}
                initial={editing.area}
                saveStatus={save}
                onSave={(project, completed) => {
                  const next = { id: editing.id, area: project };
                  setEditing(next);
                  void persist(next, completed);
                }}
              />
            ) : null}
            {editing && 'rn' in editing && rn ? (
              <RnArtStudio
                key={editing.id}
                config={rn}
                initial={editing.rn}
                saveStatus={save}
                onSave={(project, completed) => {
                  const next = { id: editing.id, rn: project };
                  setEditing(next);
                  void persist(next, completed);
                }}
              />
            ) : null}
            {editing && 'pa' in editing && pa ? (
              <PaArtStudio
                key={editing.id}
                config={pa}
                initial={editing.pa}
                saveStatus={save}
                onSave={(project, completed) => {
                  const next = { id: editing.id, pa: project };
                  setEditing(next);
                  void persist(next, completed);
                }}
              />
            ) : null}
            {editing && 'flow' in editing && flow ? (
              <FlowComposer
                key={editing.id}
                config={flow}
                initial={editing.flow}
                saveStatus={save}
                onSave={(f, completed) => {
                  const next = { id: editing.id, flow: f };
                  setEditing(next);
                  void persist(next, completed);
                }}
              />
            ) : null}
          </View>
          <ConfirmDialog
            visible={deleting !== null}
            title="Delete this project?"
            message={deleting ? `“${deleting.title}” will be deleted. This cannot be undone.` : undefined}
            confirmLabel="Delete"
            destructive
            loading={busy}
            onConfirm={() => void remove()}
            onCancel={() => setDeleting(null)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScrollLockContext.Provider>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', flexWrap: 'wrap' },
  saved: { borderWidth: 1, padding: 12 },
  grow: { flexGrow: 1 },
});
