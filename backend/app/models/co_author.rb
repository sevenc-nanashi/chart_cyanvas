class CoAuthor < ApplicationRecord
  belongs_to :chart
  belongs_to :user
end
