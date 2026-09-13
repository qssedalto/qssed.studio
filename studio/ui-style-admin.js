export function adminStyles() {
  return `    /* ADMIN_UI_POLISH_V1 */

    .admin-toolbar:has(#admin-user-search){
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      align-items:stretch!important;
      gap:12px!important;
    }

    .admin-toolbar:has(#admin-log-search){
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      align-items:stretch!important;
      gap:12px!important;
    }

    .admin-toolbar:has(#admin-user-search)>*,
    .admin-toolbar:has(#admin-log-search)>*{
      width:100%!important;
      min-width:0!important;
      height:54px!important;
      min-height:54px!important;
      margin:0!important;
      align-self:stretch!important;
      box-sizing:border-box!important;
    }

    .admin-toolbar:has(#admin-user-search) input,
    .admin-toolbar:has(#admin-user-search) select,
    .admin-toolbar:has(#admin-log-search) input,
    .admin-toolbar:has(#admin-log-search) select{
      padding-left:16px!important;
      padding-right:16px!important;
      border-radius:16px!important;
      line-height:normal!important;
    }

    #admin-users-table .admin-table-row{
      grid-template-columns:
        minmax(100px,.72fr)
        minmax(132px,.92fr)
        minmax(220px,1.40fr)
        68px
        minmax(156px,1fr)
        minmax(156px,1fr)
        minmax(142px,.94fr)
        minmax(142px,.94fr)
        minmax(142px,.94fr)
        minmax(112px,.78fr)!important;
      min-width:1430px!important;
      column-gap:12px!important;
    }

    #admin-users-table .admin-table-row select{
      width:100%!important;
      min-width:0!important;
      height:44px!important;
      min-height:44px!important;
      padding:0 36px 0 13px!important;
      border-radius:14px!important;
      white-space:nowrap!important;
      font-size:15px!important;
    }

    .permission-grid{
      grid-template-columns:minmax(320px,1.75fr) repeat(3,minmax(132px,.58fr))!important;
    }

    .permission-head{
      display:flex!important;
      align-items:center!important;
      color:var(--muted)!important;
      font-size:13px!important;
      font-weight:800!important;
      letter-spacing:.01em!important;
    }

    .permission-grid>strong:not(.permission-head){
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      min-width:0!important;
      text-align:center!important;
    }

    .permission-key{
      min-width:0!important;
    }

    #admin-user-search,
    #admin-role-filter,
    #admin-status-filter,
    #admin-log-search,
    #admin-log-action,
    #admin-log-severity,
    #admin-log-actor,
    #admin-log-from,
    #admin-log-to{
      vertical-align:middle!important;
    }

    @media(max-width:980px){
      .admin-toolbar:has(#admin-user-search),
      .admin-toolbar:has(#admin-log-search){
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
      .permission-grid{
        grid-template-columns:minmax(260px,1.5fr) repeat(3,minmax(118px,.62fr))!important;
      }
    }

    @media(max-width:640px){
      .admin-toolbar:has(#admin-user-search),
      .admin-toolbar:has(#admin-log-search){
        grid-template-columns:1fr!important;
      }
    }
`;
}
