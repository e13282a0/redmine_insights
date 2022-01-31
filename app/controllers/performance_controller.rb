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
    start_date = start_time_entry.spent_on.to_date
    past_weeks = start_date.upto(Date.today).count.fdiv(7).ceil
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

     #make series for activities
     activity_ids = time_entries.pluck(:activity_id).to_a()
     activities = Enumeration.where(:id => activity_ids).to_a()
 
     @activity_series = Hash.new()
     @activity_series["items"]=[]
     @activity_series["axis"]=time_beam_array
     @activity_series["data"]=Hash.new()
 
     activities.each_with_index do |activity, i|   
       sum=0
       @activity_series["items"].push(activity["name"])
       @activity_series["data"][activity["name"]]=[]
       time_beam_array.each_with_index do |time_beam_elm, j|  
         related_time_entries = time_entries.where(:activity_id => activity["id"], :tweek => time_beam_elm.cweek, :tyear=>time_beam_elm.cwyear)
         val = related_time_entries.sum { |a| a.hours }
         sum+=val
         entry = Hash.new(time_beam_elm)
         entry["date"]=time_beam_elm
         entry["val"]=val
         entry["sum"]=sum
         @activity_series["data"][activity["name"]].push(entry)
       end
     end



     # make tree of tasks
     @issues_tree = make_nodes(top_level_issues)



    #versions
    versions = Version.where(:project_id => @project.id).where.not(:effective_date => nil).to_a()
    @versions = versions.map{|version| {'versionID'=>version.id, 'name'=>version.name, 'effectiveDate'=>version.effective_date, 'status'=>version.status, 'week'=>version.effective_date.cweek, 'year'=>version.effective_date.cwyear}}
  

    #marklines
    mark_lines = []
    time_beam_array.each_with_index do |time_beam_elm, i|  
      version = versions.find{|elm| time_beam_elm.cweek== elm.effective_date.cweek and time_beam_elm.cwyear== elm.effective_date.cwyear}
      #(1..10).find     { |i| i % 5 == 0 and i % 7 == 0 }   #=> nil
      unless version.nil?
        mark_line = Hash.new()
        mark_line["xAxis"]=i
        mark_line["name"]=version.name
        mark_lines.push(mark_line)
      end
    end
    @user_series["markLines"]=mark_lines
    @task_series["markLines"]=mark_lines
    @activity_series["markLines"]=mark_lines


    @task_series = @task_series.to_json.html_safe
    @user_series= @user_series.to_json.html_safe
    @activity_series = @activity_series.to_json.html_safe
    @issues_tree = @issues_tree.to_json.html_safe
    @versions = @versions.to_json.html_safe
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

  def make_nodes(_issues) 
    result=[]
    _issues.each_with_index do |_issue, i| 
      result_elm=Hash.new
      result_elm["name"]=_issue.subject
      result_elm["value"]=_issue.total_spent_hours
      result_elm["status"]= _issue.status_id.blank? ? nil : IssueStatus.find(_issue.status_id)["name"]
      result_elm["is_open"]= _issue.status_id.blank? ? true : _issue.status_id < 2
      result_elm["is_closed"]= _issue.status_id.blank? ? nil : IssueStatus.find(_issue.status_id)["is_closed"]
      result_elm["assignee"] = _issue.assigned_to.blank? ? nil : _issue.assigned_to.lastname
      children = get_child_issues(_issue.id)
      result_elm["children"] = children.to_a.length > 0 ? make_nodes(children) : []
      result.push(result_elm)
    end
    result
  end

  def get_child_issues(issue_id) 
    Issue.where(:parent_id => issue_id)
  end

end
