# frozen_string_literal: true
class Like < ApplicationRecord
  belongs_to :chart
  counter_culture :chart
  belongs_to :user
end
