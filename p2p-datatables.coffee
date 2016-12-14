# Redirect old server to new
if document.location.hostname == "p2p.getunik.net"
  document.location.hostname = "helvetas.raisenow.net"

# Write style tag with src
# //cdn.datatables.net/1.10.10/css/jquery.dataTables.min.css
# GM_addStyle("body { color: white; background-color: black; } img { border: 0; }");
GM_addStyle(GM_getResourceText("datatables_css"))
GM_addStyle("
  input[type='text'], textarea { width: 100%; }
  textarea {height: 5em;}
  table.dataTable thead .sorting_asc {
    background-image: url(#{GM_getResourceURL('sort_asc')});
  }
  table.dataTable thead .sorting_asc_disabled {
    background-image: url(#{GM_getResourceURL('sort_asc_disabled')});
  }
  table.dataTable thead .sorting {
    background-image: url(#{GM_getResourceURL('sort_both')});
  }
  table.dataTable thead .sorting_desc {
    background-image: url(#{GM_getResourceURL('sort_desc')});
  }
  table.dataTable thead .sorting_desc_disabled {
    background-image: url(#{GM_getResourceURL('sort_desc_disabled')});
  }
  .table-striped tbody>tr:nth-child(odd)>td, .table-striped tbody>tr:nth-child(odd)>th {
    background-color: inherit;
  }
  .dt-button { margin-right: 1em; }
")

$.extend $.fn.dataTable.defaults,
    order: [[0, 'desc']]
    lengthMenu: [ [50, -1], [50, "All"] ]
    pageLength: 50
    responsive: true
    select: true
    dom: 'Blftipr'
    buttons:[
      {
        extend: 'colvis',
        collectionLayout: 'fixed two-column'
      },
      {
        extend: 'copyHtml5',
        text: 'Copy all'
      },
      {
        extend: 'copyHtml5',
        text: 'Copy selected',
        exportOptions: {
          modifier: {
            selected: true
          }
        }
      },
      {
        extend: 'excelHtml5',
        text: 'XLS all'
      },
      {
        extend: 'excelHtml5',
        text: 'XLS selected',
        exportOptions: {
          modifier: {
            selected: true
          }
        }
      }
    ]



$.fn.extend
  addDateOrder: (options) ->
    settings =
      formatString: "DD.MM.YYYY HH:mm"
      debug: false

    settings = $.extend settings, options

    log = (message) ->
      console?.log message if settings.debug

    return @each () ->
      try
        formattedDate = moment($(this)[0].textContent, settings.formatString).format()
        log "formatted date:"+formattedDate
        $(this).attr("data-order", formattedDate)
      catch error
        log "ERROR:\nType: #{error.type}\nArgs: #{error.arguments}\nMessage: #{error.message}"

$.fn.extend
  addProperties: (options) ->
    settings =
      campaigns: {}
      debug: false

    settings = $.extend settings, options

    log = (message) ->
      console?.log message if settings.debug

    return @each (index) ->
      campaign_id = parseInt($("td:nth-child(1)", this)[0].innerHTML, 10)
      campaign = settings.campaigns[campaign_id]
      log "campaign_id:"
      log campaign.id
      campaigner = campaign.user
      log "campaigner"
      log JSON.stringify(campaigner)
      email = campaigner.email
      log "email:"
      log email
      purpose = campaign.purpose
      log "purpose:"
      log purpose
      campaign_type = campaign.campaign_type
      log "campaign_type:"
      log campaign_type
      # email
      $("td:nth-child(5)", this).append("<a href='mailto:#{email}'>#{email}</a>")
      is_public = (campaign_is_public) ->
        if campaign_is_public
          "public"
        else
          "private"
      $("td:nth-child(10)", this).append(is_public(campaign.is_public))
      # purpose
      $("td:nth-child(12)", this).append("<a href='/organisations/helvetas/purposes/#{purpose?.identifier}/edit'>#{purpose?.id}: #{purpose?.identifier}</a>")
      #campaign_type
      $("td:nth-child(13)", this).append("<a href='/organisations/helvetas/campaigntypes/#{campaign_type?.identifier}/edit'>#{campaign_type?.id}: #{campaign_type?.identifier}</a>")
      # parent campaign
      parent_campaign_id = parseInt($("td:nth-child(18)", this)[0].innerHTML, 10)
      if  !isNaN(parent_campaign_id)
        log "parent_campaign_id:"
        log parent_campaign_id
        parent_campaign =  settings.campaigns[parent_campaign_id]
        log "parent_campaign:"
        $("td:nth-child(18)", this)[0].innerHTML =
        "<a href='/organisations/helvetas/campaigners/#{parent_campaign.user.username}/campaigns/#{parent_campaign.identifier}/edit'>
          #{parent_campaign.id}:
          #{parent_campaign.name}
        </a>"
      # campaigner link
      campaigner_link = "
      <a href='/organisations/helvetas/campaigners/#{campaigner.username}/edit'>
        #{campaigner.username}
      </a>
      "
      $("td:nth-child(2)", this)[0].innerHTML = campaigner_link
      # first name
      $("td.firstname", this)[0].innerHTML = campaigner.firstname
      # last name
      $("td.lastname", this)[0].innerHTML = campaigner.lastname
      #campaign link
      # https://life-changer.helvetas.ch/saudans/sport
      campaign_preview = "
      |
      <a href='https://life-changer.helvetas.ch/#{campaigner.username}/#{campaign.identifier}'>
        preview
      </a>
      "
      $("td:last-child", this).append campaign_preview
      # campaign ident as name
      $("td:nth-child(6)", this)[0].innerText = campaign.identifier

add_campaign_details = (location) =>
  # add headers
  $("
  <th class='firstname'>First Name</th>
  <th class='lastname'>Last Name</th>
  <th class='email'>Email</th>
  ").insertAfter($("th:nth-child(2)"))
  $("
  <th class='published'>Publication Status</th>
  ").insertAfter($("th:nth-child(9)"))
  $("
  <th class='purpose'>Purpose</th>
  <th class='campaign-type'>Type</th>
  ").insertAfter($("th:nth-child(11)"))
  # add campaigner email
  $("tbody tr td:nth-child(2)").after("
  <td class='firstname'></td>
  <td class='lastname'></td>
  <td class='email'></td>
  ")
  $("tbody tr td:nth-child(9)").after("
  <td class='published'></td>
  ")
  $("tbody tr td:nth-child(11)").after("
  <td class='purpose'></td>
  <td class='campaign-type'></td>
  ")
  # fetch details
  $.getJSON location+".json", (data) ->
    campaigns = {}
    for campaign in data.campaigns
      campaigns[campaign.id] = campaign
    tr = $("tbody tr")
    tr.addProperties
      campaigns: campaigns
    # init Datatables
    table = $('table').DataTable()
    $('.span6').addClass('span12').removeClass('span6')
    table.buttons().container().appendTo( $('.col-sm-6:eq(0)', table.table().container() ) )


here = window.location.pathname
if here == "/organisations/helvetas/campaign/list"
  $("td:nth-child(0n+4)").addDateOrder
    formatString: "DD.MM.YYYY"
  $("td:nth-child(0n+5)").addDateOrder
    formatString: "DD.MM.YYYY"
  add_campaign_details(here)
else if here == "/organisations/helvetas/urlalias/list"
  $("td:nth-child(0n+3)").addDateOrder
    formatString: "DD.MM.YYYY HH:mm"
  $("td:nth-child(0n+4)").addDateOrder
    formatString: "DD.MM.YYYY HH:mm"
  # init Datatables
  table = $('table').DataTable()
  $('.span6').addClass('span12').removeClass('span6')
  table.buttons().container().appendTo( $('.col-sm-6:eq(0)', table.table().container() ) )
else
  # init Datatables
  table = $('table').DataTable()
  $('.span6').addClass('span12').removeClass('span6')
  table.buttons().container().appendTo( $('.col-sm-6:eq(0)', table.table().container() ) )
