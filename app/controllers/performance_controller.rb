class PerformanceController < ApplicationController

  def index
    #@project = Project.find(params[:project_id])

  end

  #todo: generate separate controllers for project and project overview
  #todo: rename routes (index, show, etc..)
  def project
    project_id = params['project_id']
    @project = Project.find(project_id)
    # read all project related time entries
    time_entries = TimeEntry.where( :project_id => @project.id)

    # find first time entry
    start_time_entry = time_entries.min {|a,b| a.spent_on <=> b.spent_on }
    past_weeks = start_time_entry.spent_on.upto(Date.today).count.fdiv(7).ceil
    time_beam_array = time_beam(past_weeks,0)

    # make series for top level tasks

    top_level_issues = Issue.where( :project_id => @project.id, :parent_id => nil)
    @task_series = Hash.new()
    @task_series["items"]=[]
    @task_series["axis"]=time_beam_array
    @task_series["data"]=Hash.new()

    top_level_issues.each_with_index do |issue, i|   
      related_ids = issue.self_and_descendants.pluck(:id).to_a() # get own and all related issue IDs
      sum=0
      @task_series["items"].push(issue.subject)
      @task_series["data"][issue.subject]=[]
      time_beam_array.each_with_index do |time_beam_elm, j|  
        related_time_entries = time_entries.where(:issue_id => related_ids, :tweek => time_beam_elm.cweek, :tyear=>time_beam_elm.cwyear)
        val = related_time_entries.sum { |a| a.hours }
        sum+=val
        entry = Hash.new(time_beam_elm)
        entry["date"]=time_beam_elm
        entry["val"]=val
        entry["sum"]=sum
        @task_series["data"][issue.subject].push(entry)
      end
    end

    #make series for uses
    users_ids = time_entries.pluck(:user_id).to_a()
    users = User.where(:id => users_ids).to_a()

    @user_series = Hash.new()
    @user_series["items"]=[]
    @user_series["axis"]=time_beam_array
    @user_series["data"]=Hash.new()

    users.each_with_index do |user, i|   
      sum=0
      @user_series["items"].push(user["lastname"])
      @user_series["data"][user["lastname"]]=[]
      time_beam_array.each_with_index do |time_beam_elm, j|  
        related_time_entries = time_entries.where(:user_id => user["id"], :tweek => time_beam_elm.cweek, :tyear=>time_beam_elm.cwyear)
        val = related_time_entries.sum { |a| a.hours }
        sum+=val
        entry = Hash.new(time_beam_elm)
        entry["date"]=time_beam_elm
        entry["val"]=val
        entry["sum"]=sum
        @user_series["data"][user["lastname"]].push(entry)
      end
    end



    #Versions
    versions = Version.where(:project_id => @project.id).to_a()
    @versions = versions.map{|version| {'versionID'=>version.id, 'name'=>version.name, 'effectiveDate'=>version.effective_date, 'status'=>version.status, 'week'=>version.effective_date.cweek, 'year'=>version.effective_date.cwyear}}
  end


  # helper functions
  def moving_average(a, ndays, precision)
    a.each_cons(ndays).map { |e| e.reduce(&:+).fdiv(ndays).round(precision) }
  end

  def time_beam(past_weeks, future_weeks=0)
    result = []
    for i in past_weeks*-1..future_weeks
      result.push(Date.today+(i*7))
    end
    return result
  end

end
