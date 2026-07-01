/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns 'overdue' if past, 'soon' if within 2 days, or 'neutral'
 */
export function getDeadlineAlertState(deadlineStr: string, status: string): 'overdue' | 'soon' | 'neutral' {
  if (!deadlineStr || status === 'done') return 'neutral';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays <= 2) {
    return 'soon';
  } else {
    return 'neutral';
  }
}

/**
 * Returns a human-friendly label for a deadline (e.g. "Overdue by 3 days", "Due today", "Due in 2 days", "Jul 3, 2026")
 */
export function formatDeadlineFriendly(deadlineStr: string): string {
  if (!deadlineStr) return 'No deadline';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return `Overdue by ${absDays} day${absDays > 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays === 2) {
    return 'Due in 2 days';
  } else {
    // Format as Jul 3, 2026 (or whichever year)
    return new Date(deadlineStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

/**
 * Returns a simple relative time string for comments (e.g. "just now", "5m ago", "2h ago", "Jun 24")
 */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return '';
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return past.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
