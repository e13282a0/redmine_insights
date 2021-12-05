class PerformanceController < ApplicationController

  def index
    #@project = Project.find(params[:project_id])

  end

  def project
    #@project = Project.find(params[:project_id])
    @project = :project_id

  end

end
