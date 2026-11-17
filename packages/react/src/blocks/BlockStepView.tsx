// File: packages/react/src/blocks/BlockStepView.tsx | Map: types -> BlockStepView (top -> picture + badges -> title, place, text -> task -> blocks -> question) -> StepViewCountdown
import { forwardRef, useId } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Webicon } from "../components/Webicon";

export interface StepViewQuestion {
  kicker?: ReactNode;
  text: ReactNode;
  options: ReactNode[];
  /** Index of the picked answer (controlled). */
  value?: number;
  onValueChange?: (index: number) => void;
  sendLabel?: ReactNode;
  onSend?: () => void;
  hint?: ReactNode;
  name?: string;
  /** After checking (0.17.0): the picked and the right answer; the answers turn green / red and lock. */
  result?: { picked: number; correct: number };
  /** Shown in place of the send button once there is a result (an Alert with an icon, points). */
  feedback?: ReactNode;
  /** Hidden words on the marked answers, for a screen reader. */
  resultLabels?: { correct?: string; wrong?: string };
}

export interface BlockStepViewProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Left of the top row (a back button). */
  back?: ReactNode;
  /** Right of the top row (distance badge). */
  distance?: ReactNode;
  /** An img or svg; leave empty for a flat surface with `number`. */
  picture?: ReactNode;
  number?: string | number;
  /** Badges on the picture. */
  badges?: ReactNode;
  title: ReactNode;
  /** Place line under the title. */
  place?: ReactNode;
  /** What to do at this step. */
  task?: ReactNode;
  /** The content blocks: Collapsible (tip), Alert (note), ButtonLink (link), StepViewCountdown … */
  blocks?: ReactNode;
  question?: StepViewQuestion;
  /** The text of the step. */
  children?: ReactNode;
}

const icon = (name: string) => <Webicon name={name} bare fallback="iconify" />;

/** `.oc-block-step-view`: one step as the visitor sees it, with its content blocks and a question. */
export const BlockStepView = forwardRef<HTMLElement, BlockStepViewProps>(function BlockStepView(
  { back, distance, picture, number, badges, title, place, task, blocks, question, children, className, ...rest },
  ref,
) {
  const auto = useId().replace(/[^\w-]/g, "");
  const titleId = `oc-stepview-${auto}`;
  const askId = `${titleId}-ask`;
  /** "correct" on the right answer, "wrong" on a wrong pick, once there is a result. */
  const mark = (i: number): "correct" | "wrong" | undefined => {
    const r = question?.result;
    if (!r) return undefined;
    return i === r.correct ? "correct" : i === r.picked ? "wrong" : undefined;
  };
  return (
    <article ref={ref} className={cx("oc-block-step-view", className)} aria-labelledby={titleId} {...rest}>
      {(back != null || distance != null) && <div className="oc-block-step-view-top">{back ?? <span />}{distance}</div>}
      {(picture != null || number != null) && (
        <figure className={cx("oc-block-step-view-picture", picture == null && "oc-block-step-view-picture--empty")} data-number={picture == null ? number : undefined}>
          {picture}
          {badges != null && <figcaption className="oc-block-step-view-badges">{badges}</figcaption>}
        </figure>
      )}
      <h2 className="oc-block-step-view-title" id={titleId}>{title}</h2>
      {place != null && <p className="oc-block-step-view-place">{icon("mdi:map-marker-outline")} {place}</p>}
      {children != null && <div className="oc-block-step-view-text">{children}</div>}
      {task != null && <p className="oc-block-step-view-task">{icon("mdi:target")} {task}</p>}
      {blocks != null && <div className="oc-block-step-view-blocks">{blocks}</div>}
      {question && (
        <div className="oc-block-step-view-question" data-answered={question.result ? "" : undefined}>
          {question.kicker != null && <span className="oc-block-step-view-kicker">{question.kicker}</span>}
          <p className="oc-block-step-view-ask" id={askId}>{question.text}</p>
          <fieldset className="oc-block-step-view-answers" aria-labelledby={askId}>
            {question.options.map((o, i) => (
              <label key={i} className="oc-radio-item oc-radio-item--card" data-result={mark(i)}>
                <input className="oc-radio" type="radio" name={question.name ?? `${titleId}-answer`} value={i} disabled={question.result != null}
                  {...(question.value !== undefined ? { checked: question.value === i } : question.result ? { checked: question.result.picked === i } : {})}
                  onChange={() => question.onValueChange?.(i)} />
                <span>{o}</span>
                {mark(i) && <span className="oc-visually-hidden"> {mark(i) === "correct" ? question.resultLabels?.correct ?? "Correct" : question.resultLabels?.wrong ?? "Wrong"}</span>}
              </label>
            ))}
          </fieldset>
          {question.result ? question.feedback : <button className="oc-btn oc-btn--lg oc-block-step-view-send" type="button" onClick={question.onSend}>{question.sendLabel ?? "Send answer"}</button>}
          {question.hint != null && <p className="oc-block-step-view-hint">{question.hint}</p>}
        </div>
      )}
    </article>
  );
});

export interface StepViewCountdownProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  /** The time as text ("0:56"); your app updates it. */
  time: ReactNode;
  /** Part of the time left, 0–100 (width of the bar). */
  left?: number;
  tone?: "low" | "done";
}

/** `.oc-block-step-view-countdown`: label, time and a shrinking bar (the ticking stays in your app). */
export function StepViewCountdown({ label, time, left = 100, tone, className, style, ...rest }: StepViewCountdownProps) {
  return (
    <div role="timer" className={cx("oc-block-step-view-countdown", tone && `oc-block-step-view-countdown--${tone}`, className)}
      style={{ "--oc-step-view-left": `${Math.max(0, Math.min(100, left))}%`, ...style } as CSSProperties} {...rest}>
      <span className="oc-block-step-view-countdown-label">{label}</span>
      <b className="oc-block-step-view-countdown-time">{time}</b>
    </div>
  );
}
