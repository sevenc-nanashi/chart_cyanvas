# frozen_string_literal: true

class UserWarning < ApplicationRecord
  belongs_to :user
  belongs_to :moderator, class_name: "User", foreign_key: "moderator_id"

  LEVELS = { low: 0, medium: 1, high: 2, ban: 3 }.freeze
  enum :level, LEVELS

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
      updatedAt: updated_at.iso8601,
      chartTitle: chart_title,
      reason:,
      level:,
      seen:,
      endsAt: ends_at.iso8601,
      active: active?,
      moderator: include_moderator ? moderator&.to_frontend : nil
    }
  end

  def active?
    !seen || ends_at > Time.zone.now
  end

  def seen!
    update!(seen: true)
  end

  def ends_at
    return Time.new("9999-12-31T23:59:59") if level == "ban"

    if seen
      updated_at + WARNING_TIMEOUTS[level.to_sym]
    else
      Time.zone.now + WARNING_TIMEOUTS[level.to_sym]
    end
  end
end
