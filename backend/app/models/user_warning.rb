# frozen_string_literal: true

class UserWarning < ApplicationRecord
  belongs_to :user
  belongs_to :moderator,
             class_name: "User",
             optional: true

  LEVELS = { low: 0, medium: 1, high: 2, ban: 3 }.freeze
  enum :level, LEVELS

  TARGET_TYPES = { chart: 0, user: 1 }.freeze
  enum :target_type, TARGET_TYPES

  WARNING_TIMEOUTS = {
    low: 0,
    medium: 1.day,
    high: 1.week,
    ban: 9999.years
  }.freeze

  def to_frontend(include_moderator: false)
    {
      id:,
      createdAt: created_at.iso8601,
      reason:,
      level:,
      seen: seen?,
      endsAt: ends_at.iso8601,
      active: active?,
      moderator: include_moderator ? moderator&.to_frontend : nil,
      targetType: target_type,
      targetName: target_name,
      chartDeleted: chart_deleted
    }
  end

  def active?
    !seen? || ends_at > Time.zone.now
  end

  def seen!
    update!(seen_at: Time.zone.now)
  end

  def seen?
    seen_at.present?
  end

  def ends_at
    return Time.zone.parse("9999-12-31T23:59:59") if level == "ban"

    if seen?
      seen_at + WARNING_TIMEOUTS[level.to_sym]
    else
      Time.zone.now + WARNING_TIMEOUTS[level.to_sym]
    end
  end
end
