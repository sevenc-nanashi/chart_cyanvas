# frozen_string_literal: true
class User < ApplicationRecord
  has_many :charts, foreign_key: :author_id, dependent: :destroy
  belongs_to :user, optional: true, foreign_key: :owner_id
  has_many :alt_users, foreign_key: :owner_id, dependent: :destroy, class_name: "User"

  def display_handle
    owner_id ? "x#{handle}" : handle
  end

  def to_frontend(with_chart_count: false)
    {
      handle: owner_id ? "x#{handle}" : handle,
      name:,
      aboutMe: about_me,
      bgColor: bg_color,
      fgColor: fg_color,
      chartCount: with_chart_count ? charts.where(is_public: true).count : nil
    }
  end
end
