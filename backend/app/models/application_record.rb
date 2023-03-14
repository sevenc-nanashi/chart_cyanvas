# frozen_string_literal: true
require "shortuuid"

class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  UUID_CHARS =
    "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ".chars.freeze

  def self.uuid
    ShortUUID.shorten(SecureRandom.uuid, UUID_CHARS).rjust(23, "A")
  end
end
