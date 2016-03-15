// ==UserScript==
// @name         P2P Datatables
// @namespace    http://juan.one/helvetas
// @version      1.1
// @description  adds Datatables to P2P Backend.
// @author       http://juan.one/1
// @require      http://coffeescript.org/extras/coffee-script.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.11/js/jquery.dataTables.min.js
// @require      https://cdn.datatables.net/responsive/2.0.2/js/dataTables.responsive.min.js
// @require      https://cdn.datatables.net/select/1.1.2/js/dataTables.select.min.js
// @require      https://cdn.datatables.net/buttons/1.1.2/js/dataTables.buttons.min.js
// @require      https://cdn.datatables.net/buttons/1.1.2/js/buttons.flash.min.js
// @require      https://cdn.datatables.net/buttons/1.1.2/js/buttons.html5.min.js
// @require      https://cdn.datatables.net/buttons/1.1.2/js/buttons.print.min.js
// @require      https://cdn.datatables.net/buttons/1.1.2/js/buttons.colVis.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.20/pdfmake.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.20/vfs_fonts.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.2/moment.min.js
// @resource     datatables_css https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.11/css/jquery.dataTables.min.css
// @resource     datatables_responsive_css https://cdn.datatables.net/responsive/2.0.2/css/responsive.dataTables.min.css
// @resource     datatables_select_css https://cdn.datatables.net/select/1.1.2/css/select.dataTables.min.css
// @resource     sort_asc https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.11/images/sort_asc.png
// @resource     sort_asc_disabled https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.11/images/sort_asc_disabled.png
// @resource     sort_both https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.11/images/sort_both.png
// @resource     sort_desc https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.11/images/sort_desc.png
// @resource     sort_desc_disabled https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.11/images/sort_desc_disabled.png
// @match        *://p2p.getunik.net/organisations/helvetas/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// ==/UserScript==
/* jshint ignore:start */
var inline_src = (<><![CDATA[
# Write style tag with src
# //cdn.datatables.net/1.10.10/css/jquery.dataTables.min.css
# GM_addStyle("body { color: white; background-color: black; } img { border: 0; }");
GM_addStyle(GM_getResourceText("datatables_css"))
GM_addStyle(GM_getResourceText("datatables_responsive_css"))
GM_addStyle(GM_getResourceText("datatables_select_css"))
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
    lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ]
    responsive: true
    select: true
    dom: 'Blfrtip'
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
      # purpose
      $("td:nth-child(16)", this).append("<a href='/organisations/helvetas/purposes/#{purpose?.identifier}/edit'>#{purpose?.id}: #{purpose?.identifier}</a>")
      #campaign_type
      $("td:nth-child(17)", this).append("<a href='/organisations/helvetas/campaigntypes/#{campaign_type?.identifier}/edit'>#{campaign_type?.id}: #{campaign_type?.identifier}</a>")
      # parent campaign
      parent_campaign_id = parseInt($("td:nth-child(15)", this)[0].innerHTML, 10)
      if  !isNaN(parent_campaign_id)
        log "parent_campaign_id:"
        log parent_campaign_id
        parent_campaign =  settings.campaigns[parent_campaign_id]
        log "parent_campaign:"
        $("td:nth-child(15)", this)[0].innerHTML =
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
  <th class='purpose'>Purpose</th>
  <th class='campaign-type'>Type</th>
  ").insertAfter($("th:nth-child(15)"))
  # add campaigner email
  $("tbody tr td:nth-child(2)").after("
  <td class='firstname'></td>
  <td class='lastname'></td>
  <td class='email'></td>
  ")
  $("tbody tr td:nth-child(15)").after("
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
      debug: true
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


]]></>).toString();
var compiled = this.CoffeeScript.compile(inline_src);
eval(compiled);
/* jshint ignore:end */